import {
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  toHex,
  stringToBytes,
  type Hash,
  type Hex
} from "viem";
import { v4 as uuidv4 } from "uuid";
import { INTENT_ABI } from "./utils/abi.js";
import { Constants } from "./utils/constants.js";
import { paymasterData } from "./utils/paymaster.js";
import { nonceToBigInt } from "./utils/nonceToBigInt.js";
import { signUserOp, executeUserOp, type SessionConfig } from "./utils/userOpExecutor.js";
import dotenv from "dotenv";
import { getChains } from "./utils/getChains.js";

dotenv.config();

const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as Hash;
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN as string;

interface EVMRawTransaction {
  from: string; 
  to: string;
  data?: string;
  value?: number | bigint;
}

interface Data {
  caip2Id: string;
  transaction: EVMRawTransaction;
}

/**
* Raw Transaction Intent: this function executes raw EVM transactions.
* For more information, check https://docs.okto.tech/docs/openapi/evmRawTransaction
*/
async function rawTransaction(data: Data, sessionConfig: SessionConfig) {
  console.log("Data: ", data);
  console.log("Session Config: ", sessionConfig);

  const nonce = uuidv4();
  const jobParametersAbiType = "(string caip2Id, bytes[] transactions)";
  const gsnDataAbiType = `(bool isRequired, string[] requiredNetworks, ${jobParametersAbiType}[] tokens)`;

  // Fetch all enables networks
  const chains = await getChains(OktoAuthToken);
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
  
  const currentChain = chains.find((chain: any) => chain.caip_id === data.caip2Id);
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
  console.log("Unsigned UserOp: ", userOp);
  // Sample Response:
  // Unsigned UserOp: {
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

  const jobId = await executeUserOp(signedUserOp, OktoAuthToken);
  console.log("JobId: ", jobId);
  // Sample Response:
  // JobId: 3ee33731-9e96-4ab9-892c-ea476b36295d
}

// To get the caip2Id, please check: https://docsv2.okto.tech/docs/openapi/technical-reference
const data: Data = {
  caip2Id: "eip155:84532", // BASE_TESTNET
  transaction: {
    from: "0x2C6Ef84acD95dA1407712f9Ae4698973D644408b",
    to: "0x967b26c9e77f2f5e0753bcbcb2bb624e5bbff24c",
    data: "0x", // Default empty data
    value: 1000000000000, 
  },
};

const sessionConfig: SessionConfig = {
  sessionPrivKey:
    "0x096644bf3e32614bb33961d9762d9f2b2768b4ed2e968de2b59c8148875dcec0",
  sessionPubkey:
    "0x04f8e7094449d09d932f78ca4413fbff252fbe4f99445bcc4a4d5d16c31d898f4b8b080289a906334b2bfe6379547c97c6b624afdf0bcdfab5fdfcc28d0dbb98df",
  userSWA: "0x61795557B50DC229199cE51c46935d7eC560c52F",
};

rawTransaction(data, sessionConfig);