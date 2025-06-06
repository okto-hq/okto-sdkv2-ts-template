// NOTE : This script is a work in progress and may not be fully functional.
/*
 * This script explains how to perform raw txn execute intent when the okto auth token is available
 */

import { toHex, type Hash, type Hex } from "viem";
import { v4 as uuidv4 } from "uuid";
import { Constants } from "../helper/constants.js";
import { paymasterData } from "../utils/generatePaymasterData.js";
import {
  signUserOp,
  executeUserOp,
  type SessionConfig,
} from "../utils/invokeExecuteUserOp.js";
import dotenv from "dotenv";
import { estimateUserOp } from "../utils/invokeEstimateUserOp.js";
import { getChains } from "../explorer/getChains.js";
import { getOrderHistory } from "../utils/getOrderHistory.js";
import type { Address } from "../helper/types.js";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN as string;

interface EVMRawTransaction {
  from: string;
  to: string;
  data?: string;
  value?: Hex | Hash | number;
}

interface Data {
  caip2Id: string;
  transactions: EVMRawTransaction[];
}

/**
 * EvM Raw Transaction Intent: this function executes the raw transaction between addresses.
 * For more information, check https://docs.okto.tech/docs/openapi/evmRawTransaction
 *
 * @param data - The parameters for transferring the Raw Transaction (caip2Id, transaction)
 * @param sessionConfig - The sessionConfig object containing user SWA and session keys.
 * @returns The jobid for the NFT transfer.
 */
async function rawTransaction(
  data: Data,
  sessionConfig: SessionConfig,
  feePayerAddress?: Address
) {
  // Generate a unique UUID based nonce
  const nonce = uuidv4();

  // get the Chain CAIP2ID required for payload construction
  // Note: Only the chains enabled on the Client's Developer Dashboard will be shown in the response
  const chains = await getChains(OktoAuthToken);
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
    (chain: any) => chain.caip_id === data.caip2Id
  );
  if (!currentChain) {
    throw new Error(`Chain Not Supported`);
  }

  // create the Estimate UserOp payload for token transfer intent
  console.log("generating estimateUserOp Payload...");
  let estimateUserOpPayload;

  if (feePayerAddress) {
    estimateUserOpPayload = {
      type: "RAW_TRANSACTION",
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
        caip2Id: data.caip2Id,
        transactions: [...data.transactions],
      },
    };
  } else {
    estimateUserOpPayload = {
      type: "RAW_TRANSACTION",
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
        caip2Id: data.caip2Id,
        transactions: [...data.transactions],
      },
    };
  }

  // Sample Payload: {
  //     "type": "RAW_TRANSACTION",
  //     "jobId": "18e9d5f5-03b9-48fa-8720-ec68f7e4257d",
  //     "feePayerAddress": "0xdb9B5bbf015047D84417df078c8F06fDb6D71b76",
  //     "gasDetails": {
  //         "maxFeePerGas": "0xBA43B7400",
  //         "maxPriorityFeePerGas": "0xBA43B7400"
  //     },
  //     "paymasterData": "0x0000000000000000000000006b6fad2600bc57075ee560a6fdf362ffefb9dc3c00000000000000000000000000000000000000000000000000000194e0c0336c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041a7d59936eb44abe904522f6bfd87a8c5ff2e1acf768ad34695e2370950b7e9160e6924d788a22594bff085c185e4ed63ae0498d1628b2749979bb2b1fafb61f41b00000000000000000000000000000000000000000000000000000000000000",
  //     "details": {
  //         "caip2Id": "eip155:137",
  //         "transactions": [
  //             {
  //                 "data": "0x0ce51f56000000000000000000000000d711a6da536f04f4394e259e1977f2ade3eb8dc3000000000000000000000000000000000000000000000000000010822dc491d700000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000045663937623937353235323939633936323639633962316233363235653662346630666139363964663733633532663661306235323338373430623032383865362e6a736f6e000000000000000000000000000000000000000000000000000000",
  //                 "from": "0x0058277dfC89a0E546BDc0949A35d610c8a7d987",
  //                 "to": "0xD6d06Cf01cb1316E813dCeFE0a7A2558a3FAEAc1",
  //                 "value": "0x0"
  //             }
  //         ]
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
  const userOp = estimateUserOpResponse.data?.userOps;
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

  // Execute the userOp
  const jobId = await executeUserOp(signedUserOp, OktoAuthToken);
  console.log("JobId: ", jobId);
  // Sample Response:
  // JobId: 3ee33731-9e96-4ab9-892c-ea476b36295d

  // Check the status of the jobId and get the transaction details
  const txn_details = await getOrderHistory(
    OktoAuthToken,
    jobId,
    "RAW_TRANSACTION"
  );
  console.log("Order Details:", JSON.stringify(txn_details, null, 2));
}

// To get the caip2Id, please check: https://docsv2.okto.tech/docs/openapi/technical-reference
const data: Data = {
  caip2Id: "eip155:84532", // BASE_TESTNET
  transactions: [
    {
      data: "0x", // Default empty data
      from: "0x2FAb7Eb7475F6fF9a0258F1fb4383a6aA30A18e0",
      to: "0x88beE8eb691FFAFB192BAC4D1E7042e1b44c3eF2",
      value: toHex(10000000000000), // amount in Hex (0x0 = 0)
    },
  ],
};

const sessionConfig: SessionConfig = {
  sessionPrivKey:
    "0x66aa53e1a76063c5ab0bac70c660bc227f1e4d5434051b049f74e2df99516875",
  sessionPubkey:
    "0x043d389621778ecac37ba11c085db06fb29219b09c130ef84026cf221464a3907c0e3e6a5943a6e0617ca75c32537a531f61201c4241ef44645bb154d6cec0393c",
  userSWA: "0x2FAb7Eb7475F6fF9a0258F1fb4383a6aA30A18e0",
};

/*
 * FeePayerAddress is the PaymasterSWA, which can be retrieved from the okto Developer dashboard - dashboard.okto.tech;
 * The gas fee will be deducted from the sponsor wallet; the sponsor wallet must be enabled and funded on the source chain on the txn you are performing.
 * Do not provide a field named feePayerAddress in estimateUserOpPayload if sponsorship is not enabled.
 */
const feePayerAddress: Address = "0xdb9B5bbf015047D84417df078c8F06fDb6D71b76";

/* if sponsorship is not enabled */
rawTransaction(data, sessionConfig);

/* if sponsorship is enabled */
// rawTransaction(data, sessionConfig, feePayerAddress);
