/*
 * This script explains how to perform a token transfer intent when the session config for a user is stored securely and retrieved after successful auth
 * A Token Transfer intent requires 4 parameters:
 * 1. Network CAIP2 ID: This is the CAIP2 ID of the blockchain network on which you are performing the transaction. CAIP2 ID can be retrieved from https://docs.okto.tech/docs/technical-reference or from the getChains call
 * 2. Token Address: This is the contract address of the fungible token that is being transferred. In case you are sending the Native Token and the contract address is not available, it can be left as an empty string. The Address of the token can be fetched from the response of the GetTokens or GetPortfolio call.
 * 3. Recipient Address: This is the wallet address of the recipient to whom the tokens are being sent on the same blockchain network. In case you are sending tokens to another okto embedded wallet, please fetch the wallet address on the chain needed using the GetWallet function with the recipient's auth token.
 * 4. Amount: This is the amount of tokens being sent in the lowest decimal denomination. The decimal for a token can be retrieved from the response of the GetTokens call.
 * 5. (optional) Fee Payer: This is the paymaster SWA from the okto dashboard. Only pass when the dapp wants to sponsor the user's transaction, and sponsorship is enabled correctly on the okto dashboard. please see https://docs.okto.tech/docs/developer-admin-dashboard/sponsorship on how to enable sponsorship.
 * Note 1: Token Transfer is always  performed from an okto embedded wallet. Therefore, the signer must have enough balance to perform the token transfer. The balance of the signer can be fetched from the GetPortfolio call.
 * Note 2: If sponsorship is not enabled on the okto dashboard, make sure you have sufficient native funds on the sender/signer's wallet to account for gas fees. When transferring native tokens, make sure the amount value allows room in the balance for gas fees deduction.
 * Note 3: Always have a buffer token; it's unlikely that a txn that empties the balance will succeed
 */
/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import {
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  toHex,
  type Hex,
} from "viem";
import { v4 as uuidv4 } from "uuid";
import { INTENT_ABI } from "../helper/abi.js";
import { Constants } from "../helper/constants.js";
import { paymasterData } from "../utils/generatePaymasterData.js";
import { nonceToBigInt } from "../helper/nonceToBigInt.js";
import {
  signUserOp,
  executeUserOp,
  type SessionConfig,
  getUserOperationGasPrice,
} from "../utils/invokeExecuteUserOp.js";
import { getChains } from "../explorer/getChains.js";

import dotenv from "dotenv";
import type { Address, ExecuteUserOpResponse } from "../helper/types.js";
import { getOrderHistory } from "../utils/getOrderHistory.js";
import { getAuthorizationToken } from "../utils/getAuthorizationToken.js";

dotenv.config();
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;

interface Data {
  caip2Id: string;
  recipient: string;
  token: string;
  amount: number;
}

/**
 * Creates and executes a user operation for token transfer.
 *
 * All calls to okto must be made to the Okto Chain. Hence, sent as a user operation.
 *
 * This function initiates the process of transferring a token by encoding the necessary parameters into a User Operation.
 * For more information, check https://docs.okto.tech/docs/openapi/tokenTransfer
 *
 * @param data - The parameters for transferring the token (caip2Id, recipientWalletAddress, tokenAddress, amount)
 * @param sessionConfig - The sessionConfig object containing user SWA and session keys.
 * @returns The job ID for the token transfer.
 */
export async function transferToken(
  data: Data,
  sessionConfig: SessionConfig,
  feePayerAddress?: Address
) {
  // Generate OktoAuthToken using session data
  const OktoAuthToken = await getAuthorizationToken(sessionConfig);

  // Generate a unique UUID based nonce
  const nonce = uuidv4();

  // Get the Intent execute API info as required on Okto chain
  const jobParametersAbiType =
    "(string caip2Id, string recipientWalletAddress, string tokenAddress, uint amount)";
  const gsnDataAbiType = `(bool isRequired, string[] requiredNetworks, ${jobParametersAbiType}[] tokens)`;

  // get the Chain CAIP2ID required for payload construction
  // Note: Only the chains enabled on the Client's Developer Dashboard will be shown in the response
  const chainsResponse = await getChains(OktoAuthToken);
  const chains = chainsResponse.data.network;
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
  //   }
  // ]

  const currentChain = chains.find(
    (chain: any) => chain.caip_id.toLowerCase() === data.caip2Id.toLowerCase()
  );

  if (!currentChain) {
    throw new Error(`Chain Not Supported`);
  }

  // if feePayerAddress is not provided, it will be set to the default value '0x0000000000000000000000000000000000000000
  if (!feePayerAddress) {
    feePayerAddress = Constants.FEE_PAYER_ADDRESS;
  }

  console.log("feePayerAddress:", feePayerAddress);
  console.log("current chain:", currentChain);

  // create the UserOp Call data for token transfer intent
  const calldata = encodeAbiParameters(
    parseAbiParameters("bytes4, address,uint256, bytes"),
    [
      Constants.EXECUTE_USEROP_FUNCTION_SELECTOR,
      Constants.getEnvConfig().JOB_MANAGER_ADDRESS,
      Constants.USEROP_VALUE,
      encodeFunctionData({
        abi: INTENT_ABI,
        functionName: Constants.FUNCTION_NAME,
        args: [
          toHex(nonceToBigInt(nonce), { size: 32 }),
          clientSWA,
          sessionConfig.userSWA,
          feePayerAddress,
          encodeAbiParameters(
            parseAbiParameters("(bool gsnEnabled, bool sponsorshipEnabled)"),
            [
              {
                gsnEnabled: currentChain.gsn_enabled ?? false,
                sponsorshipEnabled: currentChain.sponsorship_enabled ?? false,
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
              caip2Id: data.caip2Id,
              recipientWalletAddress: data.recipient,
              tokenAddress: data.token,
            },
          ]),
          Constants.INTENT_TYPE.TOKEN_TRANSFER,
        ],
      }),
    ]
  );
  console.log("calldata: ", calldata);
  // Sample Response:
  // 0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000e2bb608bf66b81d3edc93e77ef1cddee4fdc679e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000003e48fa61ac000000000000000000000000000000000cfcb83f026674a128790839a86e944d7000000000000000000000000e8201e368557508bf183d4e2dce1b1a1e0bd20fa000000000000000000000000fbb05b5bf0192458e0ca5946d7b82a61eba9802500000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000000000000c6569703135353a38343533320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307839363762323663396537376632663565303735336263626362326262363234653562626666323463000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e544f4b454e5f5452414e5346455200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

  const gasPrice = await getUserOperationGasPrice(OktoAuthToken);

  // Construct the UserOp with all the data fetched above, sign it and add the signature to the UserOp
  const userOp = {
    sender: sessionConfig.userSWA,
    nonce: toHex(nonceToBigInt(nonce), { size: 32 }),
    paymaster: Constants.getEnvConfig().PAYMASTER_ADDRESS, //paymaster address
    callGasLimit: toHex(Constants.GAS_LIMITS.CALL_GAS_LIMIT),
    verificationGasLimit: toHex(Constants.GAS_LIMITS.VERIFICATION_GAS_LIMIT),
    preVerificationGas: toHex(Constants.GAS_LIMITS.PRE_VERIFICATION_GAS),
    maxFeePerGas: gasPrice.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
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

  // Sign the userOp
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
  const executeResponse: ExecuteUserOpResponse = await executeUserOp(
    signedUserOp,
    OktoAuthToken
  );
  const jobId = executeResponse.data.jobId;
  console.log("Job ID:", jobId);
  // Sample Response:
  // jobId: a0a54427-11c8-4140-bfcc-e96af15ce9cf

  // Check the status of the jobId and get the transaction details
  const txn_details = await getOrderHistory(
    OktoAuthToken,
    jobId,
    "TOKEN_TRANSFER"
  );
  console.log("Order Details:", JSON.stringify(txn_details, null, 2));
}

/* To get the caipId, please check: https://docs.okto.tech/docs/openapi/technical-reference
* Sample data for APTOS_TESTNET
* const data: Data = {
*  caip2Id: "aptos:testnet", // APTOS_TESTNET
*   recipient: "0x9ed7f8c95c5e2c3cb06dfbb48681b87401fabeb88b7d710db3720f7a2ca3fffc", // Sample recipient on APTOS_TESTNET
*   token: '0x1::aptos_coin::AptosCoin', // Left empty because transferring native token
*   amount: 100000, // denomination in lowest decimal (8 for APT)
* };
*
* Sample data for BASE_TESTNET
* const data: Data = {
*   caip2Id: "eip155:84532", // BASE_TESTNET
*   recipient: "0x88beE8eb691FFAFB192BAC4D1E7042e1b44c3eF2", // Sample recipient on BASE_TESTNET
*   token: '', // Left empty because transferring native token
*   amount: 100000000000, // denomination in lowest decimal (18 for WETH)
* };
*
* Sample Usage
* const data: Data = {
*  caip2Id: "aptos:testnet", // APTOS_TESTNET
*  recipient:
*    "0x9ed7f8c95c5e2c3cb06dfbb48681b87401fabeb88b7d710db3720f7a2ca3fffc", // Sample recipient on APTOS_TESTNET
*  token: "0x1::aptos_coin::AptosCoin", // Left empty because transferring native token
*  amount: 100000, // denomination in lowest decimal (8 for APT)
* };
*/

 /*
 * A Session Config is created at the time of okto authentication and should be saved securely on the client side for each user.
 * A user is uniquely identified in Okto by their UserSWA.
 * Before any intent or explorer function calls, the okto auth token (used as the bearer token in the header) must be regenerated for that user on the client side using their session config
 */
const sessionConfig: SessionConfig = {
  sessionPrivKey:
    "0xeda300b9343c197a8d07c22110807cde6ea81ceb390143a4424180a140f7308f", // created at client side during auth and stored locally; retreived from dashboard in case of treasury wallet
  sessionPubKey:
    "0x0411f09aa634f2698759fc6881471279fca19148a3899338fdd5f855a2230ec70d3b162e39b0c1704187167ecd0de5f946d1a57f66293db697de3fe725a89452cc", // created at client side during auth and stored locally; in case of treasury wallet can be generated from private key
  userSWA: "0xd917DFbdA2Bd9EF9628DA4E55150f6559aF5b6ac", // retrieved at the time of authenticate for users; or treasurySWA in case the signer is treasury wallet
};

/*
 * FeePayerAddress is the PaymasterSWA, which can be retrieved from the okto Developer dashboard - dashboard.okto.tech;
 * The gas fee will be deducted from the sponsor wallet; the sponsor wallet must be enabled and funded on the source chain on the txn you are performing.
 * Do not provide a field named feePayerAddress in estimateUserOpPayload if sponsorship is not enabled.
 */
const feePayerAddress: Address = "0x16AE632061A09B43239a20C83eE311245d5e03BA";

/* if sponsorship is not enabled */
transferToken(data, sessionConfig);

/* uncomment if sponsorship is enabled */
// transferToken(data, sessionConfig, feePayerAddress);
