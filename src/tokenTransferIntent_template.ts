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
import {
  signUserOp,
  executeUserOp,
  type SessionConfig,
} from "./utils/userOpEstimateAndExecute.js";
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

  const currentChain = chains.find(
    (chain: any) => chain.caip_id === data.caipId
  );
  if (!currentChain) {
    throw new Error(`Chain Not Supported`);
  }

  // create the UserOp Call data for token transfer intent
  const calldata = encodeAbiParameters(
    parseAbiParameters("bytes4, address,uint256, bytes"),
    [
      "0x8dd7712f", //execute userop function selector
      "0xE2BB608BF66b81d3EDc93e77ef1CdDEE4Fdc679e", // This Job Manager is replaced by "TokenTransferBloc" address
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
  // 0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000e2bb608bf66b81d3edc93e77ef1cddee4fdc679e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000003e48fa61ac000000000000000000000000000000000cfcb83f026674a128790839a86e944d7000000000000000000000000e8201e368557508bf183d4e2dce1b1a1e0bd20fa000000000000000000000000fbb05b5bf0192458e0ca5946d7b82a61eba9802500000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000000000000c6569703135353a38343533320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307839363762323663396537376632663565303735336263626362326262363234653562626666323463000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e544f4b454e5f5452414e5346455200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

  // Construct the UserOp with all the data fetched above, sign it and add the signature to the userOp
  const userOp = {
    sender: sessionConfig.userSWA,
    nonce: toHex(nonceToBigInt(nonce), { size: 32 }),
    paymaster: "0x74324fA6Fa67b833dfdea4C1b3A9898574d076e3", //paymaster address
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
  //   Signed UserOp:  {
  //   sender: '0xfBb05b5Bf0192458E0Ca5946d7B82a61Eba98025',
  //   nonce: '0x00000000000000000000000000000000cfcb83f026674a128790839a86e944d7',
  //   paymaster: '0x74324fA6Fa67b833dfdea4C1b3A9898574d076e3',
  //   callGasLimit: '0x493e0',
  //   verificationGasLimit: '0x30d40',
  //   preVerificationGas: '0xc350',
  //   maxFeePerGas: '0x77359400',
  //   maxPriorityFeePerGas: '0x77359400',
  //   paymasterPostOpGasLimit: '0x186a0',
  //   paymasterVerificationGasLimit: '0x186a0',
  //   callData: '0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000e2bb608bf66b81d3edc93e77ef1cddee4fdc679e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000003e48fa61ac000000000000000000000000000000000cfcb83f026674a128790839a86e944d7000000000000000000000000e8201e368557508bf183d4e2dce1b1a1e0bd20fa000000000000000000000000fbb05b5bf0192458e0ca5946d7b82a61eba9802500000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000000000000c6569703135353a38343533320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307839363762323663396537376632663565303735336263626362326262363234653562626666323463000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e544f4b454e5f5452414e5346455200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  //   paymasterData: '0x000000000000000000000000e8201e368557508bf183d4e2dce1b1a1e0bd20fa00000000000000000000000000000000000000000000000000000000680f6f3d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004143e39953bef95eaf46f118c12748d914acc439a7a129768c3217869ed85d8d6843e835be5b6b35320d8301d1d153dbc03de27372782f49ac0e18e31a2c437b3d1c00000000000000000000000000000000000000000000000000000000000000',
  //   signature: '0x90d255c36bbe3612480f9c53fc80f5b37f0553ab8e512864ad2da326f912e42b7ddd1b13c714aaec6fd86846fc8d3e5eef29cfce9a74ae24f47280c0a4a733251c'
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
  amount: 10000000000, // denomination in lowest decimal (18 for WETH)
};

const sessionConfig: SessionConfig = {
  sessionPrivKey:
    "0xaa994b32b38e9c1d5bca1465ddebb99b0529c45bc3f07de17b964f40a7983b0a",
  sessionPubkey:
    "0x04bb6a7aa9d8b1a90ec372083d1b8f18aa030b0fb28694d2cd83a6ab4a9fea8d42c0c0e352f79c45cad9255a408cb964f8f9c410f0ba7e45ce859822f9f5f90c73",
  userSWA: "0xfBb05b5Bf0192458E0Ca5946d7B82a61Eba98025",
};

transferToken(data, sessionConfig);
