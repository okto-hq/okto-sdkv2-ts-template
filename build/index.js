"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_js_sdk_1 = require("@okto_web3/core-js-sdk");
const explorer_1 = require("@okto_web3/core-js-sdk/explorer");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    // Initialize OktoClient
    const oktoClient = new core_js_sdk_1.OktoClient({
        environment: process.env.ENVIRONMENT,
        vendorPrivKey: process.env.VENDOR_PRIVATE_KEY,
        vendorSWA: process.env.VENDOR_SWA,
    });
    // Log in using Google OAuth and Okto Client
    const user = yield oktoClient.loginUsingOAuth({
        idToken: 'YOUR_GOOGLE_ID_TOKEN',
        provider: 'google',
    });
    console.log('User: ', user);
    // // Verify login
    // const isLoggedIn = await oktoClient.verifyLogin()
    // console.log('Is Logged In: ', isLoggedIn);
    // // Generate authorization token
    // const authToken = await oktoClient.getAuthorizationToken()
    // console.log('Auth Token: ', authToken);
    // Get your wallets
    const wallets = yield (0, explorer_1.getAccount)(oktoClient);
    console.log('Wallets: ', wallets);
    // Check your portfolio
    const portfolio = yield (0, explorer_1.getPortfolio)(oktoClient);
    console.log('Portfolio: ', portfolio);
    // Get all supported chains
    const chains = yield (0, explorer_1.getChains)(oktoClient);
    console.log('Supported Chains: ', chains);
    // Get all supported tokens
    const tokens = yield (0, explorer_1.getTokens)(oktoClient);
    console.log('Supported Tokens: ', tokens);
    // Get portfolio activity
    const portfolioActivity = yield (0, explorer_1.getPortfolioActivity)(oktoClient);
    console.log('Portfolio Activity: ', portfolioActivity);
    // // Get NFT portfolio
    // const nftPortfolio = await getPortfolioNFT(oktoClient)
    // console.log('NFT Portfolio: ', nftPortfolio);
    // // Get NFT Collections
    // const nftCollections = await getNftCollections(oktoClient)
    // console.log('NFT Collections: ', nftCollections);
    // Transfer tokens
    // const transferTokensUserOp = await tokenTransfer(oktoClient, {
    //     amount: 10000000000000000,
    //     recipient: '0x7f8B35D47AaCf62ed934327AA0A42Eb6C08C2E67',
    //     token: '',
    //     chain: 'eip155:137',
    // })
    // console.log('Transfer Tokens UserOp: ', transferTokensUserOp);
    // const signedTransferTokensUserOp = await oktoClient.signUserOp(transferTokensUserOp)
    // console.log('Signed Transfer Tokens UserOp: ', signedTransferTokensUserOp);
    // const txHash = await oktoClient.executeUserOp(signedTransferTokensUserOp)
    // console.log('Job ID: ', txHash);
    // // Transfer NFT
    // const transferNFTUserOp = await nftTransfer(oktoClient, {
    //     networkId: 'eip155:137',
    //     collectionAddress: '0x0000000000000000000000000000000000000000',
    //     nftId: '1',
    //     recipientWalletAddress: '0x7f8B35D47AaCf62ed934327AA0A42Eb6C08C2E67',
    //     amount: 1,
    //     type: 'nft',
    // })
    // console.log('Transfer NFT UserOp: ', transferNFTUserOp);
    // const signedTransferNFTUserOp = await oktoClient.signUserOp(transferNFTUserOp)
    // console.log('Signed Transfer NFT UserOp: ', signedTransferNFTUserOp);
    // const txHash = await oktoClient.executeUserOp(signedTransferNFTUserOp)
    // console.log('Job ID: ', txHash);
    // Get Order History
    const orderHistory = yield (0, explorer_1.getOrdersHistory)(oktoClient);
    console.log('Order History: ', orderHistory);
});
main();
