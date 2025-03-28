/*
* This script explains how to perform token transfer intent when the okto auth token is available
*/

import {
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  toHex,
  type Hash,
  type Hex,
} from "viem";
import { v4 as uuidv4 } from "uuid";
import { INTENT_ABI } from "./helper/abi.js";
import { Constants } from "./helper/constants.js";
import { paymasterData } from "./utils/generatePaymasterData.js";
import { nonceToBigInt } from "./helper/nonceToBigInt.js";
import { signUserOp, executeUserOp, type SessionConfig } from "./utils/userOpExecutor.js";
import { getChains } from "./utils/getChains.js";

import dotenv from "dotenv";

dotenv.config();
const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as Hash;
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN as string;

interface Data {
  caipId: string;
  recipient: string;
  token: string;
  amount: number;
}

/**
 * Creates and executes a user operation for token transfer.
 *
 * This function initiates the process of transferring a token by encoding the necessary parameters into a User Operation.
 * For more information, check https://docs.okto.tech/docs/openapi/tokenTransfer
 *
 * @param data - The parameters for transferring the token (caip2Id, recipientWalletAddress, tokenAddress, amount)
 * @param sessionConfig - The sessionConfig object containing user SWA and session keys.
 * @returns The job ID for the token transfer.
 */
export async function transferToken(data: Data, sessionConfig: SessionConfig) {

  // Generate a unique UUID based nonce
  const nonce = uuidv4();

  // Get the Intent execute API info
  const jobParametersAbiType =
    "(string caip2Id, string recipientWalletAddress, string tokenAddress, uint amount)";
  const gsnDataAbiType = `(bool isRequired, string[] requiredNetworks, ${jobParametersAbiType}[] tokens)`;

  // get the Chain CAIP2ID required for payload construction
  // Note: Only the chains enabled on the Client's Developer Dashboard will be shown in the response
  const chains = await getChains(OktoAuthToken);
  console.log("Chains: ", chains);
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

  const currentChain = chains.find((chain: any) => chain.caip_id === data.caipId);
  if (!currentChain) {
    throw new Error(`Chain Not Supported`);
  }

  // create the UserOp Call data for token transfer intent
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

  // Construct the UserOp with all the data fetched above, sign it and add the signature to the userOp
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
  console.log("Signed UserOp: ", signedUserOp);
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

  // Execute the userOp
  const jobId = await executeUserOp(signedUserOp, OktoAuthToken);
  console.log("Job ID:", jobId);
  // Sample Response:
  //   jobId: a0a54427-11c8-4140-bfcc-e96af15ce9cf
}

// To get the caipId, please check: https://docsv2.okto.tech/docs/openapi/technical-reference
const data: Data = {
  caipId: "eip155:84532", // BASE_TESTNET
  recipient: "0x967b26c9e77f2f5e0753bcbcb2bb624e5bbff24c", // Sample recipient on BASE_TESTNET
  token: "", // Left empty because transferring native token
  amount: 1000000000000, // denomination in lowest decimal (18 for WETH)
};

const sessionConfig: SessionConfig = {
  sessionPrivKey:
    "0x096644bf3e32614bb33961d9762d9f2b2768b4ed2e968de2b59c8148875dcec0",
  sessionPubkey:
    "0x04f8e7094449d09d932f78ca4413fbff252fbe4f99445bcc4a4d5d16c31d898f4b8b080289a906334b2bfe6379547c97c6b624afdf0bcdfab5fdfcc28d0dbb98df",
  userSWA: "0x61795557B50DC229199cE51c46935d7eC560c52F",
};

transferToken(data, sessionConfig);
