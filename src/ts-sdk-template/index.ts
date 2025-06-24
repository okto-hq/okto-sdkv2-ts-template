/*
* This script explains how to use the Okto TS SDK
* You need to setup OKTO_ENVIRONMENT, OKTO_CLIENT_PRIVATE_KEY and OKTO_CLIENT_SWA in order to run the script.
* You will be needing to setup GOOGLE_ID_TOKEN if you choose social signin.
* Please refer to following doc on how to generate GOOGLE_ID_TOKEN: https://docs.okto.tech/docs/typescript-sdk/authentication/google-oauth/get-token-id
*/
/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import { OktoClient } from "@okto_web3/core-js-sdk";
import type { Hash, Hex } from "@okto_web3/core-js-sdk/types";
import { getAccount, getPortfolio, getChains, getTokens, getPortfolioActivity, getPortfolioNFT, getNftCollections, getOrdersHistory } from "@okto_web3/core-js-sdk/explorer";
import { tokenTransfer, nftTransfer } from "@okto_web3/core-js-sdk/userop";
import readlineSync from 'readline-sync';

import dotenv from 'dotenv';
dotenv.config();


const main = async () => {
  // Initialize OktoClient
  type Env = 'staging' | 'sandbox' | 'production';
  console.log("env: ", process.env.OKTO_ENVIRONMENT)

  const oktoClient = new OktoClient({
    environment: process.env.OKTO_ENVIRONMENT as Env,
    clientPrivateKey: process.env.OKTO_CLIENT_PRIVATE_KEY as Hash,
    clientSWA: process.env.OKTO_CLIENT_SWA as Hex,
  });


  const method = readlineSync.question('Enter authentication method (social/email/whatsapp/jwt): ').toLowerCase();

  switch (method) {
    case 'social': {
      // Log in using Google OAuth and Okto Client
      // refer here to get GOOGLE_ID_TOKEN: https://docs.okto.tech/docs/typescript-sdk/authentication/google-oauth/get-token-id
      const googleIdToken = process.env.GOOGLE_ID_TOKEN as string;
      const user = await oktoClient.loginUsingOAuth({
        idToken: googleIdToken,
        provider: 'google',
      })
      console.log('User: ', user);
      break;
    }
    case 'email': {
      // Log in using Email
      const email = readlineSync.question('Enter your email: ');
      const send_email_otp_res = await oktoClient.sendOTP(email, 'email');
      console.log('Send Email OTP Response: ', send_email_otp_res);
      const otp = readlineSync.question('Enter the OTP received on email: ');
      const user = await oktoClient.loginUsingEmail(email, otp, send_email_otp_res.token);
      console.log('Verify Email OTP Response: ', user);
      break;
    }
    case 'whatsapp': {
      // Log in using WhatsApp
      const whatsapp = readlineSync.question('Enter your WhatsApp number: ');
      const send_whatsapp_otp_res = await oktoClient.sendOTP(whatsapp, 'whatsapp');
      console.log('Send WhatsApp OTP Response: ', send_whatsapp_otp_res);
      const otp = readlineSync.question('Enter the OTP received on WhatsApp: ');
      const user = await oktoClient.loginUsingWhatsApp(whatsapp, otp, send_whatsapp_otp_res.token);
      console.log('Verify WhatsApp OTP Response: ', user);
      break;
    }
    case 'jwt': {
      // Log in using JWT
      const jwt = readlineSync.question('Enter your JWT: ');
      const user = await oktoClient.loginUsingJWTAuthentication(jwt);
      console.log('JWT Login Response: ', user);
      break;
    }
  }

  // Verify login
  const isLoggedIn = await oktoClient.verifyLogin()
  console.log('Is Logged In: ', isLoggedIn);

  // Generate authorization token
  const authToken = await oktoClient.getAuthorizationToken()
  console.log('Auth Token: ', authToken);

  //printing oktoclient details
  console.log('Okto Client: ', oktoClient);

  // Get your wallets
  const wallets = await getAccount(oktoClient)
  console.log('Wallets: ', wallets);

  // Check your portfolio
  const portfolio = await getPortfolio(oktoClient)
  console.log('Portfolio: ', portfolio);

  // Get all supported chains
  const chains = await getChains(oktoClient)
  console.log('Supported Chains: ', chains);

  // Get all supported tokens
  const tokens = await getTokens(oktoClient)
  console.log('Supported Tokens: ', tokens);

  // Get portfolio activity
  const portfolioActivity = await getPortfolioActivity(oktoClient)
  console.log('Portfolio Activity: ', portfolioActivity);

  // Get NFT portfolio
  const nftPortfolio = await getPortfolioNFT(oktoClient)
  console.log('NFT Portfolio: ', nftPortfolio);

  // Get NFT Collections
  const nftCollections = await getNftCollections(oktoClient)
  console.log('NFT Collections: ', nftCollections);

  // // Transfer tokens
  const transferTokensUserOp = await tokenTransfer(oktoClient, {
    amount: 100000, // amount in wei, should be greater then 0
    recipient: '0x0000000000000000000000000000000000000000', // burn address, replace it with address you want to send your token to
    token: '', // native token in case of blank or give token contract address
    caip2Id: 'eip155:80002', // refer here to all the ids: https://docsv2.okto.tech/docs/openapi/technical-reference#network-information
  })
  console.log('Transfer Tokens UserOp: ', transferTokensUserOp);

  const signedTransferTokensUserOp = await oktoClient.signUserOp(transferTokensUserOp)
  console.log('Signed Transfer Tokens UserOp: ', signedTransferTokensUserOp);

  const transferTokenjobId = await oktoClient.executeUserOp(signedTransferTokensUserOp)
  console.log('Job ID: ', transferTokenjobId);

  // Transfer NFT
  const transferNFTUserOp = await nftTransfer(oktoClient, {
    caip2Id: 'eip155:137', // refer here to all the ids: https://docsv2.okto.tech/docs/openapi/technical-reference#network-information
    collectionAddress: '0x0000000000000000000000000000000000000000', // burn address, replace it with NFT collection address
    nftId: '1',
    recipientWalletAddress: '0x0x0000000000000000000000000000000000000000', // burn address, replace it with receipt wallet address
    amount: 1,
    nftType: 'ERC721',
  })
  console.log('Transfer NFT UserOp: ', transferNFTUserOp);

  const signedTransferNFTUserOp = await oktoClient.signUserOp(transferNFTUserOp)
  console.log('Signed Transfer NFT UserOp: ', signedTransferNFTUserOp);

  const transferNFTjobId = await oktoClient.executeUserOp(signedTransferNFTUserOp)
  console.log('Job ID: ', transferNFTjobId);

  //Get Order History
  const orderHistory = await getOrdersHistory(oktoClient)
  console.log('Order History: ', orderHistory);

  // Use signMessage() for simple message signing (EIP-191)
  const data = "Hello Okto";
  const signedMessage_response = await oktoClient.signMessage(data);
  console.log('Signed Message:', signedMessage_response);

  // Use signTypedData() for structured, secure signing (EIP-712)
  const typedData = `{
        "types": {
            "EIP712Domain": [
                { "name": "name", "type": "string" },
                { "name": "chainId", "type": "uint256" }
            ],
            "Test": [
                { "name": "message", "type": "string" }
            ]
        },
        "primaryType": "Test",
        "domain": {
            "name": "OktoTest",
            "chainId": 1
        },
        "message": {
            "message": "Test message"
        }
    }`;
  const signedTypedData_response = await oktoClient.signTypedData(typedData);
  console.log('Signed Typed Data:', signedTypedData_response);
};

main();
