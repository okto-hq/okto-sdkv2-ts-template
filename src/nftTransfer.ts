import {
    concat,
    encodeAbiParameters,
    encodeFunctionData,
    encodePacked,
    fromHex,
    hexToBigInt,
    keccak256,
    pad,
    parseAbiParameters ,
    toHex, 
    type Hash,
    type Hex
  } from "viem";
import { parse as uuidParse, v4 as uuidv4 } from "uuid";
import axios from "axios";
import { signMessage } from "viem/accounts";

import dotenv from "dotenv";

dotenv.config();
const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as Hash;
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN as string;

var INTENT_ABI = [
    {
        constant: false,
        inputs: [
            {
                name: "_jobId",
                type: "uint256"
            },
            {
                name: "_clientSWA",
                type: "address"
            },
            {
                name: "_jobCreatorId",
                type: "address"
            },
            {
                name: "_policyInfo",
                type: "bytes"
            },
            {
                name: "_gsnData",
                type: "bytes"
            },
            {
                name: "_jobParameters",
                type: "bytes"
            },
            {
                name: "_intentType",
                type: "string"
            }
        ],
        name: "initiateJob",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    }
];

var Constants = {
    HOURS_IN_MS: 60 * 60 * 1e3,
    EXECUTE_USEROP_FUNCTION_SELECTOR: "0x8dd7712f",
    FUNCTION_NAME: "initiateJob",
    USEROP_VALUE: BigInt(0),
    GAS_LIMITS: {
        CALL_GAS_LIMIT: BigInt(3e5),
        VERIFICATION_GAS_LIMIT: BigInt(2e5),
        PRE_VERIFICATION_GAS: BigInt(5e4),
        MAX_FEE_PER_GAS: BigInt(2e9),
        MAX_PRIORITY_FEE_PER_GAS: BigInt(2e9),
        PAYMASTER_POST_OP_GAS_LIMIT: BigInt(1e5),
        PAYMASTER_VERIFICATION_GAS_LIMIT: BigInt(1e5)
    },
    INTENT_TYPE: {
        TOKEN_TRANSFER: "TOKEN_TRANSFER",
        NFT_TRANSFER: "NFT_TRANSFER",
        NFT_COLLECTION_CREATION: "NFT_COLLECTION_CREATION",
        RAW_TRANSACTION: "RAW_TRANSACTION"
    },
    ENV_CONFIG: {
        STAGING: {
            PAYMASTER_ADDRESS: "0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0",
            JOB_MANAGER_ADDRESS: "0xED3D17cae886e008D325Ad7c34F3bdE030B80c2E",
            ENTRYPOINT_CONTRACT_ADDRESS: "0x8D29ECb381CA4874767Ef3744F6df37748B12715",
            CHAIN_ID: 24879
        },
        SANDBOX: {
            PAYMASTER_ADDRESS: "0x5408fAa7F005c46B85d82060c532b820F534437c",
            JOB_MANAGER_ADDRESS: "0x21E822446C32FA22b29392F29597ebdcFd8511f8",
            ENTRYPOINT_CONTRACT_ADDRESS: "0xA5E95a08229A816c9f3902E4a5a618C3928ad3bA",
            CHAIN_ID: 8801
        }
        // PRODUCTION: {
        //   PAYMASTER_ADDRESS: '0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0' as Hex,
        //   JOB_MANAGER_ADDRESS: '0xED3D17cae886e008D325Ad7c34F3bdE030B80c2E' as Hex,
        //   CHAIN_ID: 24879,
        // },
    }
};

// this function is used to create paymaster information
async function generatePaymasterData(
  address: any,
  privateKey: any,
  nonce: any,
  validUntil: any,
  validAfter: any
) {
  if (validUntil instanceof Date) {
    validUntil = Math.floor(validUntil.getTime() / 1e3);
  } else if (typeof validUntil === "bigint") {
    validUntil = parseInt(validUntil.toString());
  }
  if (validAfter instanceof Date) {
    validAfter = Math.floor(validAfter.getTime() / 1e3);
  } else if (typeof validAfter === "bigint") {
    validAfter = parseInt(validAfter.toString());
  } else if (validAfter === void 0) {
    validAfter = 0;
  }
  const paymasterDataHash = keccak256(
    encodePacked(
      ["bytes32", "address", "uint48", "uint48"],
      [
        toHex(nonceToBigInt(nonce), { size: 32 }),
        address,
        validUntil,
        validAfter,
      ]
    )
  );
  const sig = await signMessage({
    message: {
      raw: fromHex(paymasterDataHash, "bytes"),
    },
    privateKey,
  });
  const paymasterData = encodeAbiParameters(
    parseAbiParameters("address, uint48, uint48, bytes"),
    [address, validUntil, validAfter, sig]
  );
  return paymasterData;
}

async function paymasterData({
  nonce,
  validUntil,
  validAfter
} : any) {
  return generatePaymasterData(
    clientSWA,
    clientPrivateKey,
    nonce,
    validUntil,
    validAfter
  );
}

function nonceToBigInt(nonce: string): bigint {
  const uuidBytes = uuidParse(nonce); // Get the 16-byte array of the UUID
  let bigInt = BigInt(0);
  for (let i = 0; i < uuidBytes.length; i++) {
    if (uuidBytes[i] !== undefined) {
      bigInt = (bigInt << BigInt(8)) | BigInt(uuidBytes[i]!);
    }
  }

  return bigInt;
}

function generatePackedUserOp(userOp: any) {
  if (!userOp.sender || !userOp.nonce || !userOp.callData || !userOp.preVerificationGas || !userOp.verificationGasLimit || !userOp.callGasLimit || !userOp.maxFeePerGas || !userOp.maxPriorityFeePerGas || userOp.paymaster == void 0 || !userOp.paymasterVerificationGasLimit || !userOp.paymasterPostOpGasLimit || userOp.paymasterData == void 0) {
    throw new Error("Invalid UserOp");
  }
  const accountGasLimits = "0x" + pad(userOp.verificationGasLimit, {
    size: 16
  }).toString().replace("0x", "") + pad(userOp.callGasLimit, {
    size: 16
  }).toString().replace("0x", "");
  const gasFees = "0x" + pad(userOp.maxFeePerGas, {
    size: 16
  }).toString().replace("0x", "") + pad(userOp.maxPriorityFeePerGas, {
    size: 16
  }).toString().replace("0x", "");
  const paymasterAndData = userOp.paymaster ? concat([
    userOp.paymaster,
    pad(userOp.paymasterVerificationGasLimit, {
      size: 16
    }),
    pad(userOp.paymasterPostOpGasLimit, {
      size: 16
    }),
    userOp.paymasterData
  ]) : "0x";
  const packedUserOp = {
    sender: userOp.sender,
    nonce: userOp.nonce,
    initCode: "0x",
    callData: userOp.callData,
    preVerificationGas: userOp.preVerificationGas,
    accountGasLimits,
    gasFees,
    paymasterAndData
  };
  return packedUserOp;
}

function generateUserOpHash(userOp : any) {
  const pack = encodeAbiParameters(
    parseAbiParameters(
      "address, bytes32, bytes32, bytes32, bytes32, uint256, bytes32, bytes32"
    ),
    [
      userOp.sender,
      pad(userOp.nonce, {
        size: 32
      }) as `0x${string}`,
      pad(keccak256(userOp.initCode), {
        size: 32
      }) as `0x${string}`,
      pad(keccak256(userOp.callData), {
        size: 32
      }) as `0x${string}`,
      pad(userOp.accountGasLimits, {
        size: 32
      }) as `0x${string}`,
      hexToBigInt(userOp.preVerificationGas),
      pad(userOp.gasFees, {
        size: 32
      }) as `0x${string}`,
      pad(keccak256(userOp.paymasterAndData), {
        size: 32
      })
    ]
  );
  const userOpPack = encodeAbiParameters(
    parseAbiParameters("bytes32, address, uint256"),
    [keccak256(pack), Constants.ENV_CONFIG.SANDBOX.ENTRYPOINT_CONTRACT_ADDRESS as Hex, BigInt(Constants.ENV_CONFIG.SANDBOX.CHAIN_ID)]
  );
  return keccak256(userOpPack);
}

interface Config {
  clientSWA: string;
  userSWA: string;
}

interface Data {
    caipId: string;
    collectionAddress: string;
    nftId: string;
    recipientWalletAddress: string;
    amount: number | bigint;
    nftType: 'ERC721' | 'ERC1155' | string;
}

interface sessionConfig {
  sessionPrivKey: string;
  sessionPubkey: string;
  userSWA: string;
}

function serializeJSON(obj: any, space: any) {
  return JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "bigint" ? value.toString() + "n" : value,
    space
  );
}

async function signUserOp(userop: any, sessionConfig: sessionConfig) {
  const privateKey = sessionConfig.sessionPrivKey as `0x${string}`;
  const packeduserop = generatePackedUserOp(userop);
  const hash = generateUserOpHash(packeduserop);
  const sig = await signMessage({
    message: {
      raw: fromHex(hash, "bytes")
    },
    privateKey 
  });
  userop.signature = sig;
  return userop;
}

async function executeUserOp(userop: any) {
  try {
    const requestBody = {
      method: "execute",
      jsonrpc: "2.0",
      id: uuidv4(),
      params: [userop],
    };
  
    const serliazedPayload = serializeJSON(requestBody, null);
    const response = await axios.post(
      "https://sandbox-okto-gateway.oktostage.com/rpc",
      serliazedPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OktoAuthToken}`
        },
      }
    );

    return response.data.result.jobId;
  } catch (error) {
    console.error("Error executing user operation:", error);
    throw error;
  }
}

async function transferNft(data: Data, sessionConfig: sessionConfig) {
    const nonce = uuidv4();
    const jobParametersAbiType = "(string caip2Id, string nftId, string recipientWalletAddress, string collectionAddress, string nftType, uint amount)";
    const gsnDataAbiType = `(bool isRequired, string[] requiredNetworks, ${jobParametersAbiType}[] tokens)`;

    //get supported chains on okto
    const getChainsResponse = await axios.get("https://sandbox-api.okto.tech/api/oc/v1/supported/networks", {
        headers: {
            "Authorization": `Bearer ${OktoAuthToken}`
        }
    });
    const chains = getChainsResponse.data;
    const currentChain = chains.find((chain: any) => chain.caipId === data.caipId);
    if (!currentChain) {
        throw new Error(`Chain Not Supported`);
    }

    const calldata = encodeAbiParameters(
        parseAbiParameters('bytes4, address, uint256, bytes'),
        [
            "0x8dd7712f", // execute userOp function selector
            "0xED3D17cae886e008D325Ad7c34F3bdE030B80c2E", // Job manager address
            BigInt(0), // userop value
            encodeFunctionData({
                abi: INTENT_ABI,
                functionName: "initiateJob",
                args: [
                    toHex(nonceToBigInt(nonce), { size: 32 }),
                    clientSWA,
                    sessionConfig.userSWA,
                    encodeAbiParameters(
                        parseAbiParameters('(bool gsnEnabled, bool sponsorshipEnabled)'),
                        [
                            {
                                gsnEnabled: currentChain.gsnEnabled ?? false,
                                sponsorshipEnabled: currentChain.sponsorshipEnabled ?? false,
                            },
                        ],
                    ),
                    encodeAbiParameters(parseAbiParameters(gsnDataAbiType), [
                        {
                            isRequired: false,
                            requiredNetworks: [],
                            tokens: [],
                        },
                    ]),
                    encodeAbiParameters(parseAbiParameters(jobParametersAbiType), [
                        {
                            amount: BigInt(data.amount),
                            caip2Id: data.caipId,
                            recipientWalletAddress: data.recipientWalletAddress,
                            nftId: data.nftId,
                            collectionAddress: data.collectionAddress,
                            nftType: data.nftType,
                        },
                    ]),
                    "NFT_TRANSFER",
                ],
            }),
        ],
    );

    const userOp = {
        sender: sessionConfig.userSWA,
        nonce: toHex(nonceToBigInt(nonce), { size: 32 }),
        paymaster: "0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0",    //paymaster address
        callGasLimit: toHex(Constants.GAS_LIMITS.CALL_GAS_LIMIT),
        verificationGasLimit: toHex(Constants.GAS_LIMITS.VERIFICATION_GAS_LIMIT),
        preVerificationGas: toHex(Constants.GAS_LIMITS.PRE_VERIFICATION_GAS),
        maxFeePerGas: toHex(Constants.GAS_LIMITS.MAX_FEE_PER_GAS),
        maxPriorityFeePerGas: toHex(Constants.GAS_LIMITS.MAX_PRIORITY_FEE_PER_GAS),
        paymasterPostOpGasLimit: toHex(
          Constants.GAS_LIMITS.PAYMASTER_POST_OP_GAS_LIMIT
        ),
        paymasterVerificationGasLimit: toHex(
          Constants.GAS_LIMITS.PAYMASTER_VERIFICATION_GAS_LIMIT
        ),
        callData: calldata,
        paymasterData: await paymasterData({
          nonce,
          validUntil: new Date(Date.now() + 6 * Constants.HOURS_IN_MS)
        })
      };
    
      console.log(userOp);
      const signedUserOp = await signUserOp(userOp, sessionConfig);
      const jobId = await executeUserOp(signedUserOp);
      console.log(jobId);
}

const data: Data = {
    caipId: '',
    collectionAddress: '',
    nftId: '',
    recipientWalletAddress: '',
    amount: 0,
    nftType: ''
}

const sessionConfig: sessionConfig = {
    sessionPrivKey: '',
    sessionPubkey: '',
    userSWA: ''
}

transferNft(data, sessionConfig);