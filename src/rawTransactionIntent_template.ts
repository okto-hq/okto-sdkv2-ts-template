import {
  concat,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  fromHex,
  hexToBigInt,
  keccak256,
  pad,
  parseAbiParameters,
  toHex,
  stringToBytes,
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
}: any) {
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

function generateUserOpHash(userOp: any) {
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

interface EVMRawTransaction {
  from: string; // Address as a string
  to: string;
  data?: string; // Optional transaction data
  value?: number | bigint; // Optional value as number or bigint
}

interface Data {
  caip2Id: string;
  transaction: EVMRawTransaction;
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

async function rawTransaction(data: Data, sessionConfig: sessionConfig) {
  console.log("Data: ", data);
  console.log("Session Config: ", sessionConfig);

  const nonce = uuidv4();
  const jobParametersAbiType = "(string caip2Id, bytes[] transactions)";
  const gsnDataAbiType = `(bool isRequired, string[] requiredNetworks, ${jobParametersAbiType}[] tokens)`;

  //get supported networks call
  const getChainsResponse = await axios.get("https://sandbox-api.okto.tech/api/oc/v1/supported/networks", {
    headers: {
      "Authorization": `Bearer ${OktoAuthToken}`
    }
  });
  const chains = getChainsResponse.data.data.network;
  console.log("Chains: ", chains);
  // Note: only the chains enabled on the Client's developer dashboard is will shown in the response.
  // Sample Response:
  // Chains: [
  //   {
  //     caip_id: 'eip155:998',
  //     network_name: 'HYPERLIQUID_EVM_TESTNET',
  //     chain_id: '998',
  //     logo: 'HYPERLIQUID_EVM_TESTNET',
  //     sponsorship_enabled: false,
  //     gsn_enabled: false,
  //     type: 'EVM',
  //     network_id: '32270d5d-4d13-3ee2-a832-b6543c98e431',
  //     onramp_enabled: false,
  //     whitelisted: true
  //   },
  //   {
  //     caip_id: 'eip155:84532',
  //     network_name: 'BASE_TESTNET',
  //     chain_id: '84532',
  //     logo: 'BASE_TESTNET',
  //     sponsorship_enabled: false,
  //     gsn_enabled: false,
  //     type: 'EVM',
  //     network_id: '8970cafe-4fc2-3a71-a7d3-77a672b749e9',
  //     onramp_enabled: false,
  //     whitelisted: true
  //   },
  //   {
  //     caip_id: 'eip155:80002',
  //     network_name: 'POLYGON_TESTNET_AMOY',
  //     chain_id: '80002',
  //     logo: 'POLYGON_TESTNET_AMOY',
  //     sponsorship_enabled: false,
  //     gsn_enabled: false,
  //     type: 'EVM',
  //     network_id: '4adbfabd-d5e0-3d99-89e2-030eea922ed7',
  //     onramp_enabled: false,
  //     whitelisted: true
  //   },
  //   {
  //     caip_id: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  //     network_name: 'SOLANA_DEVNET',
  //     chain_id: '103',
  //     logo: 'SOL DEVNET',
  //     sponsorship_enabled: false,
  //     gsn_enabled: false,
  //     type: 'SVM',
  //     network_id: 'fb10a9ca-d197-378d-8fb3-fd95345571f3',
  //     onramp_enabled: false,
  //     whitelisted: true
  //   }
  // ]
  

  const currentChain = (chains ?? []).find(
    (chain: any) => chain.caip_id === data.caip2Id
  );
  if (!currentChain) {
    throw new Error(`Chain Not Supported`);
  }

  const calldata = encodeAbiParameters(
      parseAbiParameters("bytes4, address,uint256, bytes"),
      [
        "0x8dd7712f", //execute userop function selector
        "0xED3D17cae886e008D325Ad7c34F3bdE030B80c2E", //job manager address
        BigInt(0),
        encodeFunctionData({
          abi: INTENT_ABI,
          functionName: "initiateJob",
          args: [
            toHex(nonceToBigInt(nonce), { size: 32 }),
            clientSWA,
            sessionConfig.userSWA,
            encodeAbiParameters(
              parseAbiParameters("(bool gsnEnabled, bool sponsorshipEnabled)"),
              [
                {
                  gsnEnabled: currentChain.gsnEnabled ?? false,
                  sponsorshipEnabled: currentChain.sponsorshipEnabled ?? false,
                },
              ]
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
                caip2Id: data.caip2Id,
                transactions: [toHex(stringToBytes(JSON.stringify(data.transaction)))],
              },
            ]),
            "RAW_TRANSACTION",
          ],
        }),
      ]
    );
  console.log("Calldata: ", calldata);
  // Sample Response:
  // calldata: 0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000ed3d17cae886e008d325ad7c34f3bde030b80c2e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000004248fa61ac000000000000000000000000000000000a43a640d34d94fd2b942a353d8b6c5e5000000000000000000000000ef508a2ef36f0696e3f3c4cf3727c615eef991ce00000000000000000000000061795557b50dc229199ce51c46935d7ec560c52f00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003e000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000c6569703135353a383435333200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000897b2266726f6d223a22307832433645663834616344393564413134303737313266394165343639383937334436343434303862222c22746f223a22307839363762323663396537376632663565303735336263626362326262363234653562626666323463222c2264617461223a223078222c2276616c7565223a313030303030303030303030307d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f5241575f5452414e53414354494f4e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
  
  const userOp = {
      sender: sessionConfig.userSWA,
      nonce: toHex(nonceToBigInt(nonce), { size: 32 }),
      paymaster: "0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0", //paymaster address
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
        validUntil: new Date(Date.now() + 6 * Constants.HOURS_IN_MS),
      }),
    };
  console.log("UserOp: ", userOp);
  // Sample Response:
  // UserOp: {
  //   sender: '0x61795557B50DC229199cE51c46935d7eC560c52F',
  //   nonce: '0x0000000000000000000000000000000020ae9739583540b5a091d3cbd7f63012',
  //   paymaster: '0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0',
  //   callGasLimit: '0x493e0',
  //   verificationGasLimit: '0x30d40',
  //   preVerificationGas: '0xc350',
  //   maxFeePerGas: '0x77359400',
  //   maxPriorityFeePerGas: '0x77359400',
  //   paymasterPostOpGasLimit: '0x186a0',
  //   paymasterVerificationGasLimit: '0x186a0',
  //   callData: '0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000ed3d17cae886e008d325ad7c34f3bde030b80c2e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000004248fa61ac00000000000000000000000000000000020ae9739583540b5a091d3cbd7f63012000000000000000000000000ef508a2ef36f0696e3f3c4cf3727c615eef991ce00000000000000000000000061795557b50dc229199ce51c46935d7ec560c52f00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003e000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000c6569703135353a383435333200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000897b2266726f6d223a22307832433645663834616344393564413134303737313266394165343639383937334436343434303862222c22746f223a22307839363762323663396537376632663565303735336263626362326262363234653562626666323463222c2264617461223a223078222c2276616c7565223a313030303030303030303030307d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f5241575f5452414e53414354494f4e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  //   paymasterData: '0x000000000000000000000000ef508a2ef36f0696e3f3c4cf3727c615eef991ce0000000000000000000000000000000000000000000000000000000067cb30a9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041bef76ba22ec864ddfc1c41de5dc90d2078b6535e4e94b2f6d8e1f936b3f21cca221d37b0ede666b9ce31bee1a8f56da22f4f0ee0c429b4c10c6cadb7efc1f6a11b00000000000000000000000000000000000000000000000000000000000000'
  // }
  
  const signedUserOp = await signUserOp(userOp, sessionConfig);
  console.log("Signed UserOp: ", signedUserOp);
  // Sample Response:
  // Signed UserOp: {
  //   sender: '0x61795557B50DC229199cE51c46935d7eC560c52F',
  //   nonce: '0x000000000000000000000000000000006abfb90243c344d0abecfe537b8bc1cf',
  //   paymaster: '0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0',
  //   callGasLimit: '0x493e0',
  //   verificationGasLimit: '0x30d40',
  //   preVerificationGas: '0xc350',
  //   maxFeePerGas: '0x77359400',
  //   maxPriorityFeePerGas: '0x77359400',
  //   paymasterPostOpGasLimit: '0x186a0',
  //   paymasterVerificationGasLimit: '0x186a0',
  //   callData: '0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000ed3d17cae886e008d325ad7c34f3bde030b80c2e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000004248fa61ac0000000000000000000000000000000006abfb90243c344d0abecfe537b8bc1cf000000000000000000000000ef508a2ef36f0696e3f3c4cf3727c615eef991ce00000000000000000000000061795557b50dc229199ce51c46935d7ec560c52f00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003e000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000c6569703135353a383435333200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000897b2266726f6d223a22307832433645663834616344393564413134303737313266394165343639383937334436343434303862222c22746f223a22307839363762323663396537376632663565303735336263626362326262363234653562626666323463222c2264617461223a223078222c2276616c7565223a313030303030303030303030307d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f5241575f5452414e53414354494f4e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  //   paymasterData: '0x000000000000000000000000ef508a2ef36f0696e3f3c4cf3727c615eef991ce0000000000000000000000000000000000000000000000000000000067cb31be0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000411f98bda2e9280923224b7b33af97d2ff9040945af9b07d1cf4301f3cb5a193602425a7f1d498474d2383b17d0845e8ab50311de5c8506705ff9952f9d7ecf7991b00000000000000000000000000000000000000000000000000000000000000',
  //   signature: '0x1029e4921213c6f786f4ec9bc3c46bcefc33d7d865165c3f08aafe698da8082d3130bcbdaac4795d87934bfe93e0ac48011e87b985b721bebc7720f8ece7e9d01b'
  // }

  const jobId = await executeUserOp(signedUserOp);
  console.log("JobId: ", jobId);
  // Sample Response:
  // JobId: 3ee33731-9e96-4ab9-892c-ea476b36295d
}

// To get the caip2Id, please check: https://docsv2.okto.tech/docs/openapi/technical-reference
const data: Data = {
  caip2Id: "eip155:84532", // Replace with the actual CAIP-2 ID (e.g., "eip155:1" for Ethereum Mainnet)
  transaction: {
    from: "0x2C6Ef84acD95dA1407712f9Ae4698973D644408b",
    to: "0x967b26c9e77f2f5e0753bcbcb2bb624e5bbff24c",
    data: "0x", // Default empty data
    value: 1000000000000, // Default value as 0 ETH
  },
};
const sessionConfig: sessionConfig = {
  sessionPrivKey:
    "0x096644bf3e32614bb33961d9762d9f2b2768b4ed2e968de2b59c8148875dcec0",
  sessionPubkey:
    "0x04f8e7094449d09d932f78ca4413fbff252fbe4f99445bcc4a4d5d16c31d898f4b8b080289a906334b2bfe6379547c97c6b624afdf0bcdfab5fdfcc28d0dbb98df",
  userSWA: "0x61795557B50DC229199cE51c46935d7eC560c52F",
};

rawTransaction(data, sessionConfig);
