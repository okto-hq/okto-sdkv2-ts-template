import { OktoClient } from "@okto_web3/core-js-sdk";
import { getAccount, getPortfolio, getChains, getTokens, getPortfolioActivity, getPortfolioNFT, getNftCollections, getOrdersHistory } from "@okto_web3/core-js-sdk/explorer";
import { tokenTransfer, nftTransfer } from "@okto_web3/core-js-sdk/userop";
import { Env } from "@okto_web3/core-js-sdk/dist/core/types";

import dotenv from 'dotenv';
dotenv.config();

const main = async () => {
    // Initialize OktoClient
    const oktoClient = new OktoClient({
        environment: process.env.ENVIRONMENT as Env,
        vendorPrivKey: process.env.VENDOR_PRIVATE_KEY as Env,
        vendorSWA: process.env.VENDOR_SWA as Env,
    });

    // Log in using Google OAuth and Okto Client
    const user = await oktoClient.loginUsingOAuth({
        idToken:
            'YOUR_GOOGLE_ID_TOKEN',
        provider: 'google',
    })
    console.log('User: ', user);

    // Verify login
    const isLoggedIn = await oktoClient.verifyLogin()
    console.log('Is Logged In: ', isLoggedIn);

    // Generate authorization token
    const authToken = await oktoClient.getAuthorizationToken()
    console.log('Auth Token: ', authToken);

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

    // Transfer tokens
    const transferTokensUserOp = await tokenTransfer(oktoClient, {
        amount: 0,
        recipient: '0x0000000000000000000000000000000000000000',
        token: '',
        chain: 'eip155:137',
    })
    console.log('Transfer Tokens UserOp: ', transferTokensUserOp);

    const signedTransferTokensUserOp = await oktoClient.signUserOp(transferTokensUserOp)
    console.log('Signed Transfer Tokens UserOp: ', signedTransferTokensUserOp);

    const jobId = await oktoClient.executeUserOp(signedTransferTokensUserOp)
    console.log('Job ID: ', jobId);

    // Transfer NFT
    const transferNFTUserOp = await nftTransfer(oktoClient, {
        networkId: 'eip155:137',
        collectionAddress: '0x0000000000000000000000000000000000000000',
        nftId: '1',
        recipientWalletAddress: '0x0x0000000000000000000000000000000000000000',
        amount: 1,
        type: 'nft',
    })
    console.log('Transfer NFT UserOp: ', transferNFTUserOp);

    const signedTransferNFTUserOp = await oktoClient.signUserOp(transferNFTUserOp)
    console.log('Signed Transfer NFT UserOp: ', signedTransferNFTUserOp);

    const jobId2 = await oktoClient.executeUserOp(signedTransferNFTUserOp)
    console.log('Job ID: ', jobId2);

    //Get Order History
    const orderHistory = await getOrdersHistory(oktoClient)
    console.log('Order History: ', orderHistory);
};

main();
