import dotenv from 'dotenv';
dotenv.config();

import { getQuote } from './api/getQuote.js';
import { getBestRoute } from './api/getBestRoute.js';
import { getCallData } from './api/getCallData.js';
import { registerIntent } from './api/registerIntent.js';
import { Wallet, JsonRpcProvider } from 'ethers';
import type { GetQuoteResponseData, GetBestRouteRequest, GetBestRouteResponse, GetCallDataRequest, GetCallDataResponse, GetQuoteRequest, RegisterIntentRequest} from './utils/types.js';

const wallet = new Wallet('0x3996037c38de9ce767477181b52ec3868811176d596bcc87f9b9e1b1e83e0dc8');
const provider = new JsonRpcProvider('https://mainnet.infura.io');
const fromAmount = '10000000000000';                   // 0.00001 ETH in wei 
const fromChain = 'eip155:1';
const fromTokenAddress = '';                           // Send empty string for native token
const walletAddress = '<wallet_address>';
const toChain = 'eip155:1';
const toTokenAddress = '';                             // Send empty string for native token

async function generateCallData(routeResponse: GetBestRouteResponse, permitData?: any, signature?: string) {
  const callDataRequestPayload: GetCallDataRequest = {
    routeId: routeResponse.routeId ?? "",
    fromToken: fromTokenAddress.toLowerCase(),
    toToken: toTokenAddress.toLowerCase(),
    fromChain,
    toChain,
    fromAmount,
    toTokenAmountMinimum: routeResponse.outputAmount ?? "0",
    slippage: '0.5',
    fromUserWalletAddress: walletAddress,
    toUserWalletAddress: walletAddress,
    permitSignature: signature,
    permitData: permitData ? JSON.stringify(permitData) : undefined
  };

  const callDataResponse: GetCallDataResponse = await getCallData(callDataRequestPayload);
  console.log('Call data response: ');
  console.dir({ callDataResponse });

  const steps = callDataResponse.steps || [];
  const firstStep = steps[0];
  if (!firstStep || !firstStep.metadata) {
      console.error("Invalid response from call data");
      return;
  }

  const { transactionType, protocol, serviceType } = firstStep.metadata;

  if (transactionType === "approval") {
      await submitTransactionByType("approval", callDataResponse);
  } else if (
      transactionType === "init" &&
      protocol === "Okto-ULL" &&
      serviceType === "bridge"
  ) {
      await handleInitBridgeTxn(callDataResponse);
  } else if (
      protocol === "Okto-ULL" &&
      serviceType === "bridge" &&
      !transactionType
  ) {
      await handleRegisterIntent(callDataResponse, fromChain);
  } else {
      console.log("Unrecognized call data response");
  }

}

async function submitTransactionByType(type: "approval" | "dex", responseToUse: any) {

    if (
        !responseToUse ||
        !walletAddress ||
        !responseToUse.steps ||
        responseToUse.steps.length === 0 
      ) {
        console.error("Some required data missing");
        return;
      }

      if (responseToUse.steps.length === 0) {
        console.error("No steps found in route response");
        return;
      }

      const step = responseToUse.steps.find(
        (s: any) => s.metadata?.transactionType === type
      );
  
      if (!step || !step.txnData) {
        console.warn(`No ${type} transaction found`);
        return;
      }

  try {
    console.log(`Submitting ${type} transaction...`);
    const signer = wallet.connect(provider);

    const txRequest: any = step.txnData;
    
    const tx = await signer.sendTransaction({
      to: txRequest.to,
      data: txRequest.data,
      value: txRequest.value ? BigInt(txRequest.value) : undefined,
      gasLimit: txRequest.gasLimit ? BigInt(txRequest.gasLimit) : undefined,
    });

    console.log(`${type} tx submitted: ${tx.hash}`);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`${type} tx confirmed`, receipt);

     // Move to next step
     if (type === "approval") {
        const remainingSteps = responseToUse.steps.filter(
          (s: any) => s.metadata?.transactionType !== "approval"
        );

        if (remainingSteps.length != 1) {
          console.error("Invalid remaining steps after approval");
          return;
        }

        const nextStep = remainingSteps[0];
        const metaData = nextStep.metadata;
        if (!metaData) {
          console.error("Remaining step does not have metadata");
          return;
        }

        if (metaData.serviceType === "bridge") {
          if (metaData.transactionType === "init") {
            await handleInitBridgeTxn(nextStep.txnData);
            return;
          } else if (!metaData.transactionType) {
            await handleRegisterIntent(responseToUse, fromChain);
            return;
          }
          console.error("Unknown transaction type");
          return;
        }

        await submitTransactionByType("dex", responseToUse);
      } else {
        return;
      }

  } catch (error) {
    console.error(`Failed to send ${type} transaction`, error);
    throw error;
  }
}

async function handleInitBridgeTxn(callDataResponse: GetCallDataResponse) {

    if (
        !walletAddress ||
        !callDataResponse ||
        !callDataResponse.steps 
      ) {
        console.error("Missing data to initiate bridge transaction.");
        return;
      }
  
      const step = callDataResponse.steps.find(
        (s) =>
          s.metadata?.transactionType === "init" &&
          s.metadata?.protocol === "Okto-ULL" &&
          s.metadata?.serviceType === "bridge"
      );
  
      if (!step || !step.txnData) {
        console.error("No bridge transaction data found.");
        return;
      }

  try {
    console.log('Initiating bridge transaction...');
    const signer = wallet.connect(provider);
    const txRequest = step.txnData as any;

    const tx = await signer.sendTransaction({
      to: txRequest.to,
      data: txRequest.data,
      value: txRequest.value ? BigInt(txRequest.value) : undefined,
      gasLimit: txRequest.gasLimit ? BigInt(txRequest.gasLimit) : undefined,
    });

    console.log(`Bridge tx submitted: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log("Bridge transaction confirmed", receipt);
    return receipt;
  } catch (error) {
    console.error("Failed to send bridge transaction", error);
    throw error;
  }
}

async function handleRegisterIntent(callDataResponse: GetCallDataResponse, fromChain: string) {
    
    if (!walletAddress || !callDataResponse || !fromChain) {
        console.error("Missing required data to register intent.");
        return;
    }
  try {
    console.log('Registering intent...');

    const orderTypedData = callDataResponse.orderTypedData;
    if (!orderTypedData) {
      console.error("Missing order typed data.");
      return;
    }

    const parsedData = JSON.parse(orderTypedData as string);
    const signature = await wallet.signMessage(parsedData);    // TODO : convert to eth_signTypedData_v4

    const crossChainOrderStep = callDataResponse.steps?.find(
        (s: any) =>
          s.metadata?.serviceType === "bridge" &&
          s.metadata.protocol === "Okto-ULL"
      );
      const intentCalldata = crossChainOrderStep?.intentCalldata as string;

    if (!intentCalldata) {
      throw new Error("Missing call data bytes");
    }

    const registerIntentPayload: RegisterIntentRequest = {
        orderBytes: intentCalldata,
        orderBytesSignature: signature,
        caipId: fromChain,
      };

    const intentRes = await registerIntent(registerIntentPayload);

    console.log("Register intent response", intentRes);
    console.log("Cross chain order registered successfully.");
    return intentRes;
  } catch (error) {
    console.error("Failed to register intent", error);
    throw error;
  }
}

async function main() {
  try {

    // Step 1: Get quote
    console.log('Sending getQuote request...');
    const quoteRequestPayload: GetQuoteRequest = {
      fromChain,
      toChain,
      fromToken: fromTokenAddress.toLowerCase(),
      toToken: toTokenAddress.toLowerCase(),
      fromAmount,
      fromUserWalletAddress: walletAddress,
      toUserWalletAddress: walletAddress
    };

    const quoteResponse: GetQuoteResponseData = await getQuote(quoteRequestPayload);
    console.log('Quote response: ');
    console.dir({ quoteResponse });
    

    // Step 2: Get best route
    console.log('Sending getBestRoute request...');
    const getBestRoutePayload: GetBestRouteRequest = {
        fromChain,
        toChain,
        fromToken: fromTokenAddress.toLowerCase(),
        toToken: toTokenAddress.toLowerCase(),
        fromAmount,
        fromUserWalletAddress: walletAddress,
        toUserWalletAddress: walletAddress,
    };

    const routeResponse: GetBestRouteResponse = await getBestRoute(getBestRoutePayload);
    if (!routeResponse.outputAmount) {
        console.error("Failed to get route output amount");
        return;
    }
    console.log('Route response: ');
    console.dir({ routeResponse });


    // Check if it's a cross-chain transaction
    const fromChainId = fromChain.split(":")[1];
    const toChainId = toChain.split(":")[1];
    const isCrossChain = fromChainId !== toChainId;

    if (isCrossChain && routeResponse.permitDataToSign && walletAddress) {
        // Sign the permit data
        console.log('Signing permit data...');
        const permitData = JSON.parse(routeResponse.permitDataToSign as string);
        const signature = await wallet.signMessage(permitData);   // TODO : convert to eth_signTypedData_v4
        
        // Get call data with signature
        console.log('Getting call data with signature...');
        const callDataResponse = await generateCallData(routeResponse, permitData, signature);
        
    } else if (isCrossChain) {
        // Cross-chain without permit data
        console.log('Getting call data for cross-chain without permit...');
        const callDataResponse = await generateCallData(routeResponse);
     
    } else {
        // Same chain → check for approval
        const steps = routeResponse.steps || [];
        if (
            steps.length > 0 &&
            steps[0]?.metadata?.transactionType === "approval"
        ) {
            await submitTransactionByType("approval", routeResponse);
        } else {
            await submitTransactionByType("dex", routeResponse);
        }
    }

  } catch (error) {
    console.error('Error in trade flow:', error);
    process.exit(1);
  }
}

// Execute the script
main()
  .then(() => {
    console.log('Trade flow completed successfully');
    process.exit(0);
  });
