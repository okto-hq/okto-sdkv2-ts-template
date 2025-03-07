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
  type Hash,
  type Hex,
} from "viem";
import { parse as uuidParse, v4 as uuidv4 } from "uuid";
import axios from "axios";
import { signMessage } from "viem/accounts";

import dotenv from "dotenv";

dotenv.config();
const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as Hash;
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN as string;

//same ABI for all intents
var INTENT_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_jobId",
        type: "uint256",
      },
      {
        name: "_clientSWA",
        type: "address",
      },
      {
        name: "_jobCreatorId",
        type: "address",
      },
      {
        name: "_policyInfo",
        type: "bytes",
      },
      {
        name: "_gsnData",
        type: "bytes",
      },
      {
        name: "_jobParameters",
        type: "bytes",
      },
      {
        name: "_intentType",
        type: "string",
      },
    ],
    name: "initiateJob",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

// the contract addresses are for okto testnet only
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
    PAYMASTER_VERIFICATION_GAS_LIMIT: BigInt(1e5),
  },
  INTENT_TYPE: {
    TOKEN_TRANSFER: "TOKEN_TRANSFER",
    NFT_TRANSFER: "NFT_TRANSFER",
    NFT_COLLECTION_CREATION: "NFT_COLLECTION_CREATION",
    RAW_TRANSACTION: "RAW_TRANSACTION",
  },
  ENV_CONFIG: {
    STAGING: {
      PAYMASTER_ADDRESS: "0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0",
      JOB_MANAGER_ADDRESS: "0xED3D17cae886e008D325Ad7c34F3bdE030B80c2E",
      ENTRYPOINT_CONTRACT_ADDRESS: "0x8D29ECb381CA4874767Ef3744F6df37748B12715",
      CHAIN_ID: 24879,
    },
    SANDBOX: {
      PAYMASTER_ADDRESS: "0x5408fAa7F005c46B85d82060c532b820F534437c",
      JOB_MANAGER_ADDRESS: "0x21E822446C32FA22b29392F29597ebdcFd8511f8",
      ENTRYPOINT_CONTRACT_ADDRESS: "0xA5E95a08229A816c9f3902E4a5a618C3928ad3bA",
      CHAIN_ID: 8801,
    },
    // PRODUCTION: {
    //   PAYMASTER_ADDRESS: '0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0' as Hex,
    //   JOB_MANAGER_ADDRESS: '0xED3D17cae886e008D325Ad7c34F3bdE030B80c2E' as Hex,
    //   CHAIN_ID: 24879,
    // },
  },
};

//This function is used to create paymaster information
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

async function paymasterData({ nonce, validUntil, validAfter }: any) {
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
  if (
    !userOp.sender ||
    !userOp.nonce ||
    !userOp.callData ||
    !userOp.preVerificationGas ||
    !userOp.verificationGasLimit ||
    !userOp.callGasLimit ||
    !userOp.maxFeePerGas ||
    !userOp.maxPriorityFeePerGas ||
    userOp.paymaster == void 0 ||
    !userOp.paymasterVerificationGasLimit ||
    !userOp.paymasterPostOpGasLimit ||
    userOp.paymasterData == void 0
  ) {
    throw new Error("Invalid UserOp");
  }
  const accountGasLimits =
    "0x" +
    pad(userOp.verificationGasLimit, {
      size: 16,
    })
      .toString()
      .replace("0x", "") +
    pad(userOp.callGasLimit, {
      size: 16,
    })
      .toString()
      .replace("0x", "");
  const gasFees =
    "0x" +
    pad(userOp.maxFeePerGas, {
      size: 16,
    })
      .toString()
      .replace("0x", "") +
    pad(userOp.maxPriorityFeePerGas, {
      size: 16,
    })
      .toString()
      .replace("0x", "");
  const paymasterAndData = userOp.paymaster
    ? concat([
        userOp.paymaster,
        pad(userOp.paymasterVerificationGasLimit, {
          size: 16,
        }),
        pad(userOp.paymasterPostOpGasLimit, {
          size: 16,
        }),
        userOp.paymasterData,
      ])
    : "0x";
  const packedUserOp = {
    sender: userOp.sender,
    nonce: userOp.nonce,
    initCode: "0x",
    callData: userOp.callData,
    preVerificationGas: userOp.preVerificationGas,
    accountGasLimits,
    gasFees,
    paymasterAndData,
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
        size: 32,
      }) as `0x${string}`,
      pad(keccak256(userOp.initCode), {
        size: 32,
      }) as `0x${string}`,
      pad(keccak256(userOp.callData), {
        size: 32,
      }) as `0x${string}`,
      pad(userOp.accountGasLimits, {
        size: 32,
      }) as `0x${string}`,
      hexToBigInt(userOp.preVerificationGas),
      pad(userOp.gasFees, {
        size: 32,
      }) as `0x${string}`,
      pad(keccak256(userOp.paymasterAndData), {
        size: 32,
      }),
    ]
  );
  const userOpPack = encodeAbiParameters(
    parseAbiParameters("bytes32, address, uint256"),
    [
      keccak256(pack),
      Constants.ENV_CONFIG.SANDBOX.ENTRYPOINT_CONTRACT_ADDRESS as Hex,
      BigInt(Constants.ENV_CONFIG.SANDBOX.CHAIN_ID),
    ]
  );
  return keccak256(userOpPack);
}

interface Config {
  clientSWA: string;
  userSWA: string;
}

interface Data {
  caipId: string;
  recipient: string;
  token: string;
  amount: number;
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
      raw: fromHex(hash, "bytes"),
    },
    privateKey,
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
          Authorization: `Bearer ${OktoAuthToken}`,
        },
      }
    );

    return response.data.result.jobId;
  } catch (error) {
    console.error("Error executing user operation:", error);
    throw error;
  }
}

async function transferToken(data: Data, sessionConfig: sessionConfig) {
  console.log("Data: ", data);
  console.log("Session Config: ", sessionConfig);

  const nonce = uuidv4();
  const jobParametersAbiType =
    "(string caip2Id, string recipientWalletAddress, string tokenAddress, uint amount)";
  const gsnDataAbiType = `(bool isRequired, string[] requiredNetworks, ${jobParametersAbiType}[] tokens)`;

  //get supported networks call
  const getChainsResponse = await axios.get(
    "https://sandbox-api.okto.tech/api/oc/v1/supported/networks",
    {
      headers: {
        Authorization: `Bearer ${OktoAuthToken}`,
      },
    }
  );
  const chains = getChainsResponse.data.data.network;
  console.log("Chains: ", chains);
  // Note: only the chains enables on the Client's developer dashboard is will shown in the response
  // Sample Response:
  //   Chains:  [
  //   {
  //     caip_id: 'eip155:8453',
  //     network_name: 'BASE',
  //     chain_id: '8453',
  //     logo: 'BASE',
  //     sponsorship_enabled: false,
  //     gsn_enabled: false,
  //     type: 'EVM',
  //     network_id: '9400de12-efc6-3e69-ab02-0eaf5aaf21e5',
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
  //   }
  // ]

  // process.exit();

  // const currentChain = chains.find((chain: any) => chain.caipId === data.caipId);
  const currentChain = (chains ?? []).find(
    (chain: any) => chain.caip_id === data.caipId
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
              amount: BigInt(data.amount),
              caip2Id: data.caipId,
              recipientWalletAddress: data.recipient,
              tokenAddress: data.token,
            },
          ]),
          "TOKEN_TRANSFER",
        ],
      }),
    ]
  );
  console.log("calldata: ", calldata);
  // Sample Response:
  // 0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000ed3d17cae886e008d325ad7c34f3bde030b80c2e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000003e48fa61ac0000000000000000000000000000000004a50e19e7686479da93865d840341dc300000000000000000000000071c6ac62752acea820c55de730c24805a200e1ce00000000000000000000000061795557b50dc229199ce51c46935d7ec560c52f00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000009184e72a000000000000000000000000000000000000000000000000000000000000000000c6569703135353a38343533320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307839363762323663396537376632663565303735336263626362326262363234653562626666323463000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e544f4b454e5f5452414e5346455200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

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
  const signedUserOp = await signUserOp(userOp, sessionConfig);
  console.log("signed UserOp: ", signedUserOp);
  // Sample Response:
  //   signed UserOp:  {
  //   sender: '0x61795557B50DC229199cE51c46935d7eC560c52F',
  //   nonce: '0x0000000000000000000000000000000039fc9d23dda3447f89c8d3e11f9b3206',
  //   paymaster: '0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0',
  //   callGasLimit: '0x493e0',
  //   verificationGasLimit: '0x30d40',
  //   preVerificationGas: '0xc350',
  //   maxFeePerGas: '0x77359400',
  //   maxPriorityFeePerGas: '0x77359400',
  //   paymasterPostOpGasLimit: '0x186a0',
  //   paymasterVerificationGasLimit: '0x186a0',
  //   callData: '0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000ed3d17cae886e008d325ad7c34f3bde030b80c2e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000003e48fa61ac00000000000000000000000000000000039fc9d23dda3447f89c8d3e11f9b320600000000000000000000000071c6ac62752acea820c55de730c24805a200e1ce00000000000000000000000061795557b50dc229199ce51c46935d7ec560c52f00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000009184e72a000000000000000000000000000000000000000000000000000000000000000000c6569703135353a38343533320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307839363762323663396537376632663565303735336263626362326262363234653562626666323463000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e544f4b454e5f5452414e5346455200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  //   paymasterData: '0x00000000000000000000000071c6ac62752acea820c55de730c24805a200e1ce0000000000000000000000000000000000000000000000000000000067cb13a20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000419f8ec082cc1b894fcaec21d0f4cf6938427f3870d27c997d32e92a6c414301c35bfe0efe99953a772fbf4f41d199a3358c4239f4f48dc4ac1088177f5932a4e81b00000000000000000000000000000000000000000000000000000000000000',
  //   signature: '0xaeffe7a4cececd894d55cc8a049b6fb042d5e3481d7242a2c1cd81a63161a6c313bc7ad89c91ef2c44b21213c740765b4d87b32e5e84598b0284396e39565db61b'
  // }

  const jobId = await executeUserOp(signedUserOp);
  console.log(jobId);
  // Sample Response:
  //   jobId: a0a54427-11c8-4140-bfcc-e96af15ce9cf
}

// To get the capId, please check: https://docsv2.okto.tech/docs/openapi/technical-reference
const data: Data = {
  caipId: "eip155:84532", // BASE_TESTNET
  recipient: "0x967b26c9e77f2f5e0753bcbcb2bb624e5bbff24c", // Sample recipient on BASE_TESTNET
  token: "", // Left empty, because transferring native token
  amount: 1000000000000, // denomination in lowest decimal (18 for WETH)
};

const sessionConfig: sessionConfig = {
  sessionPrivKey:
    "0x096644bf3e32614bb33961d9762d9f2b2768b4ed2e968de2b59c8148875dcec0",
  sessionPubkey:
    "0x04f8e7094449d09d932f78ca4413fbff252fbe4f99445bcc4a4d5d16c31d898f4b8b080289a906334b2bfe6379547c97c6b624afdf0bcdfab5fdfcc28d0dbb98df",
  userSWA: "0x61795557B50DC229199cE51c46935d7eC560c52F",
};

transferToken(data, sessionConfig);
