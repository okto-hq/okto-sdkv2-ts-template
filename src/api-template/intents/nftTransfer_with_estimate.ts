// NOTE : This script is a work in progress and may not be fully functional.
/*
 * This script explains how to perform NFT transfer intent when the okto auth token is available
 */
/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import { toHex, type Hash, type Hex } from "viem";
import { v4 as uuidv4 } from "uuid";
import { Constants } from "../helper/constants.js";
import { paymasterData } from "../utils/generatePaymasterData.js";
import {
  signUserOp,
  executeUserOp,
  type SessionConfig,
} from "../utils/invokeExecuteUserOp.js";
import { estimateUserOp } from "../utils/invokeEstimateUserOp.js";
import dotenv from "dotenv";
import { getChains } from "../explorer/getChains.js";
import { getOrderHistory } from "../utils/getOrderHistory.js";
import type { Address, ExecuteUserOpResponse } from "../helper/types.js";
import { getAuthorizationToken } from "../utils/getAuthorizationToken.js";

dotenv.config();

interface Data {
  caipId: string;
  collectionAddress: string;
  nftId: string;
  recipientWalletAddress: string;
  amount: string;
  nftType: "ERC721" | "ERC1155" | string;
}

/**
 * NFT Transfer Intent: this function executes the NFT transfer between addresses.
 * For more information, check https://docs.okto.tech/docs/openapi/nftTransfer
 *
 * @param data - The parameters for transferring the NFT (caip2Id, nftId, recipientWalletAddress, collectionAddress, nftType, amount)
 * @param sessionConfig - The sessionConfig object containing user SWA and session keys.
 * @returns The jobid for the NFT transfer.
 */
async function transferNft(
  data: Data,
  sessionConfig: SessionConfig,
  feePayerAddress?: Address
) {
  // Generate OktoAuthToken using session data
  const OktoAuthToken = await getAuthorizationToken(sessionConfig);

  // Generate a unique UUID based nonce
  const nonce = uuidv4();

  // Get the Chain CAIP2ID required for payload construction
  // Note: Only the chains enabled on the Client's Developer Dashboard will be shown in the response
  const chainsResponse = await getChains(OktoAuthToken);
  const chains = chainsResponse.data.network;
  console.log("Chains: ", chains);
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

  const currentChain = chains.find(
    (chain: any) => chain.caip_id === data.caipId
  );
  if (!currentChain) {
    throw new Error(`Chain Not Supported`);
  }

  // create the Estimate UserOp payload for NFT transfer intent
  console.log("generating estimateUserOp Payload...");
  let estimateUserOpPayload;

  if (feePayerAddress) {
    estimateUserOpPayload = {
      type: "NFT_TRANSFER",
      jobId: nonce,
      /*
       * Provide a field named feePayerAddress in estimateUserOpPayload if sponsorship is enabled.
       */
      feePayerAddress: feePayerAddress,
      paymasterData: await paymasterData({
        nonce,
        validUntil: new Date(Date.now() + 6 * Constants.HOURS_IN_MS),
      }),
      gasDetails: {
        maxFeePerGas: toHex(Constants.GAS_LIMITS.MAX_FEE_PER_GAS),
        maxPriorityFeePerGas: toHex(
          Constants.GAS_LIMITS.MAX_PRIORITY_FEE_PER_GAS
        ),
      },
      details: {
        caip2Id: data.caipId,
        nftId: data.nftId,
        recipientWalletAddress: data.recipientWalletAddress,
        collectionAddress: data.collectionAddress,
        amount: data.amount,
        nftType: data.nftType,
      },
    };
  } else {
    estimateUserOpPayload = {
      type: "NFT_TRANSFER",
      jobId: nonce,
      /*
       * Do not provide a field named feePayerAddress in estimateUserOpPayload if sponsorship is not enabled.
       */
      paymasterData: await paymasterData({
        nonce,
        validUntil: new Date(Date.now() + 6 * Constants.HOURS_IN_MS),
      }),
      gasDetails: {
        maxFeePerGas: toHex(Constants.GAS_LIMITS.MAX_FEE_PER_GAS),
        maxPriorityFeePerGas: toHex(
          Constants.GAS_LIMITS.MAX_PRIORITY_FEE_PER_GAS
        ),
      },
      details: {
        caip2Id: data.caipId,
        nftId: data.nftId,
        recipientWalletAddress: data.recipientWalletAddress,
        collectionAddress: data.collectionAddress,
        amount: data.amount,
        nftType: data.nftType,
      },
    };
  }

  // Sample Payload: {
  //     "type": "NFT_TRANSFER",
  //     "jobId": "b9e16100-446f-4050-84ed-a846d2bae528",
  //     "feePayerAddress": "0xdb9B5bbf015047D84417df078c8F06fDb6D71b76",
  //     "paymasterData": "0x0000000000000000000000006b6fad2600bc57075ee560a6fdf362ffefb9dc3c000000000000000000000000000000000000000000000000000000006d0db17b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004135a4864cbcbd0637eba6b680e81d5aa7065b6840f0d5a246662c6cc1717c2d9e36d5d8c49d06859f2966067222870d2c1b484962a5934b9c6f94e726f21dea7b1c00000000000000000000000000000000000000000000000000000000000000",
  //     "gasDetails": {
  //         "maxFeePerGas": "0xBA43B7400",
  //         "maxPriorityFeePerGas": "0xBA43B7400"
  //     },
  //     "details": {
  //         "caip2Id": "eip155:137",
  //         "nftId": "b9e16100-446f-4050-84ed-a846d2bae528",
  //         "recipientWalletAddress": "0x6ABcD0428e3129a6110CC5dCcb4C1BfdA1b4D3C4",
  //         "collectionAddress": "0x68ee2dddcbb1c03df5fc4b6235d993b8b4d1d0e5",
  //         "amount": "1",
  //         "nftType": "ERC721"
  //     }
  // }

  // Call the estimateUserOp API to get the UserOp object
  console.log("calling estimate userop...");
  const estimateUserOpResponse = await estimateUserOp(
    estimateUserOpPayload,
    OktoAuthToken
  );
  console.log("estimateUserOpResponse:", estimateUserOpResponse);

  // Sample Response:
  // estimateUserOpResponse: {}

  // Get the UserOp from the estimate response fetched above, sign it and add the signature to the userOp
  const userOp = estimateUserOpResponse.result.userOps;
  console.log("Unsigned UserOp: ", userOp);
  // Sample Response:
  // Unsigned UserOp: {
  //   sender: '0x61795557B50DC229199cE51c46935d7eC560c52F',
  //   nonce: '0x0000000000000000000000000000000061b7d39cdbe447a4bb76fd4ae494de67',
  //   paymaster: '0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0',
  //   callGasLimit: '0x493e0',
  //   verificationGasLimit: '0x30d40',
  //   preVerificationGas: '0xc350',
  //   maxFeePerGas: '0x77359400',
  //   maxPriorityFeePerGas: '0x77359400',
  //   paymasterPostOpGasLimit: '0x186a0',
  //   paymasterVerificationGasLimit: '0x186a0',
  //   callData: '0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000ed3d17cae886e008d325ad7c34f3bde030b80c2e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000004e48fa61ac00000000000000000000000000000000061b7d39cdbe447a4bb76fd4ae494de67000000000000000000000000ef508a2ef36f0696e3f3c4cf3727c615eef991ce00000000000000000000000061795557b50dc229199ce51c46935d7ec560c52f00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000004a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000260000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c6569703135353a3830303032000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a30783539374632466439453432623538644630343738343942623239453235333737373435664630646100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a3078306235636131303135366131383432303164393336303966643764313630366331306435646132310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064552433732310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c4e46545f5452414e53464552000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  //   paymasterData: '0x000000000000000000000000ef508a2ef36f0696e3f3c4cf3727c615eef991ce0000000000000000000000000000000000000000000000000000000067cb28f7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041b951c7b6291876fbc008c633eb4cd76f004d999b07fd045eb41ceeaaf3ff252e7c7ad65d5e4953bd58ac4711ed848ac6e9a306bad90f7f7475e5b8bfa9b377f11c00000000000000000000000000000000000000000000000000000000000000'
  // }

  const signedUserOp = await signUserOp(userOp, sessionConfig);
  console.log("Signed UserOp: ", signedUserOp);
  // Sample Response:
  // Signed UserOp:  {
  //   sender: '0x61795557B50DC229199cE51c46935d7eC560c52F',
  //   nonce: '0x00000000000000000000000000000000cec00578720b4c0bb8f50e333412caaa',
  //   paymaster: '0x0871051BfF8C7041c985dEddFA8eF63d23AD3Fa0',
  //   callGasLimit: '0x493e0',
  //   verificationGasLimit: '0x30d40',
  //   preVerificationGas: '0xc350',
  //   maxFeePerGas: '0x77359400',
  //   maxPriorityFeePerGas: '0x77359400',
  //   paymasterPostOpGasLimit: '0x186a0',
  //   paymasterVerificationGasLimit: '0x186a0',
  //   callData: '0x8dd7712f00000000000000000000000000000000000000000000000000000000000000000000000000000000ed3d17cae886e008d325ad7c34f3bde030b80c2e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000004e48fa61ac000000000000000000000000000000000cec00578720b4c0bb8f50e333412caaa000000000000000000000000ef508a2ef36f0696e3f3c4cf3727c615eef991ce00000000000000000000000061795557b50dc229199ce51c46935d7ec560c52f00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000004a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000260000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c6569703135353a3830303032000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a30783539374632466439453432623538644630343738343942623239453235333737373435664630646100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a3078306235636131303135366131383432303164393336303966643764313630366331306435646132310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064552433732310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c4e46545f5452414e53464552000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  //   paymasterData: '0x000000000000000000000000ef508a2ef36f0696e3f3c4cf3727c615eef991ce0000000000000000000000000000000000000000000000000000000067cb295400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004154d449925fb981e16bce890c626a6fd936ce65ae17f2ef84db09d9a79a21c8072bd067626778646b7527139825635dae601caf1d6125905bc28b2f14387ce21e1c00000000000000000000000000000000000000000000000000000000000000',
  //   signature: '0x42286d3a9c6161859439509024660b8ab3b8884cecc9338d33b0d29f92d377311c2ed3a61cde3fcc04d5ad230e4a0abf16bce72d3fd0d4e832a96d1ddc031c661b'
  // }

  // Execute the userOp
  const executeResponse: ExecuteUserOpResponse = await executeUserOp(
    signedUserOp,
    OktoAuthToken
  );
  const jobId = executeResponse.data.jobId;
  console.log("JobId:", jobId);
  // Sample Response:
  // JobId: 14778af1-9d12-42ca-b664-1686f38f3633

  // Check the status of the jobId and get the transaction details
  const txn_details = await getOrderHistory(
    OktoAuthToken,
    jobId,
    "NFT_TRANSFER"
  );
  console.log("Order Details:", JSON.stringify(txn_details, null, 2));
}

// To get the caipId, please check: https://docsv2.okto.tech/docs/openapi/technical-reference
const data: Data = {
  caipId: "eip155:80002", // POLYGON_AMOY_TESTNET
  collectionAddress: "0x0b5ca10156a184201d93609fd7d1606c10d5da21",
  nftId: "0",
  recipientWalletAddress: "0x597F2Fd9E42b58dF047849Bb29E25377745fF0da",
  amount: "1", // Should always be >0
  nftType: "ERC721",
};

const sessionConfig: SessionConfig = {
  sessionPrivKey:
    "0xa7a313f22193aa7a7a8721b23279fcc03f5cd8b54de291f94300128eb9d9962e",
  sessionPubKey:
    "0x044a9339fd9d1526ac66f2514479b1e862340e44a73937c6efe671fa5ec9f27a18f6d3b6ac2d6cc4c70b8dba423878e2fa27d8402da90065b971e0b972898e8d76",
  userSWA: "0x8B20023FC47D8F8BDB7418722dBB0e3e9964a906",
};

/*
 * FeePayerAddress is the PaymasterSWA, which can be retrieved from the okto Developer dashboard - dashboard.okto.tech;
 * The gas fee will be deducted from the sponsor wallet; the sponsor wallet must be enabled and funded on the source chain on the txn you are performing.
 * Do not provide a field named feePayerAddress in estimateUserOpPayload if sponsorship is not enabled.
 */
const feePayerAddress: Address = "0xdb9B5bbf015047D84417df078c8F06fDb6D71b76";

/* if sponsorship is not enabled */
transferNft(data, sessionConfig);

/* if sponsorship is enabled */
transferNft(data, sessionConfig, feePayerAddress);
