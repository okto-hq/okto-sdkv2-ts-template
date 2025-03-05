import axios from "axios";
import dotenv from "dotenv";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { parse as uuidParse, v4 as uuidv4 } from 'uuid';

dotenv.config();

const API_BASE_URL = "https://sandbox-api.okto.tech"; // Replace with the correct base URL from OpenAPI docs
const API_KEY = ""; // will be created at the time of authenticate
const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY;
const clientSWA = process.env.OKTO_CLIENT_SWA;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

const generateAuthenticatePayload = async (
  authData: any,
  sessionKey: any,
  clientSWA: any,
  clientPriv: any,
): Promise<any> => {


}

const authenticate = async () => {
  try {
    //creating session key using random private key
    const session = secp256k1.utils.randomPrivateKey();
    console.log("Private Key:", session);

    //creating data payload
    const data = {
      idToken: "",
      provider: "google"
    }

    //creating nonce
    const nonce = uuidv4();
    console.log("Nonce:", nonce);

    //creating auth payload
    const authPayload = await generateAuthenticatePayload(
      data,
      session,
      clientSWA,
      clientPrivateKey
    );
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
};

// const main = async () => {
//     try {
//         // Get account details
//         const accountResponse = await axiosInstance.get("/account");
//         console.log("Account:", accountResponse.data);

//         // Get portfolio
//         const portfolioResponse = await axiosInstance.get("/portfolio");
//         console.log("Portfolio:", portfolioResponse.data);

//         // Get chains
//         const chainsResponse = await axiosInstance.get("/chains");
//         console.log("Chains:", chainsResponse.data);

//         // Get tokens
//         const tokensResponse = await axiosInstance.get("/tokens");
//         console.log("Tokens:", tokensResponse.data);

//         // Get portfolio activity
//         const activityResponse = await axiosInstance.get("/portfolio/activity");
//         console.log("Portfolio Activity:", activityResponse.data);

//         // Get portfolio NFTs
//         const portfolioNFTResponse = await axiosInstance.get("/portfolio/nfts");
//         console.log("Portfolio NFTs:", portfolioNFTResponse.data);

//         // Get NFT collections
//         const nftCollectionsResponse = await axiosInstance.get("/nft/collections");
//         console.log("NFT Collections:", nftCollectionsResponse.data);

//         // Get orders history
//         const ordersHistoryResponse = await axiosInstance.get("/orders/history");
//         console.log("Orders History:", ordersHistoryResponse.data);

//         // Token transfer
//         const tokenTransferResponse = await axiosInstance.post("/userop/token-transfer", {
//             from: "SENDER_ADDRESS",
//             to: "RECEIVER_ADDRESS",
//             amount: "AMOUNT",
//             token: "TOKEN_SYMBOL"
//         });
//         console.log("Token Transfer Response:", tokenTransferResponse.data);

//         // NFT transfer
//         const nftTransferResponse = await axiosInstance.post("/userop/nft-transfer", {
//             from: "SENDER_ADDRESS",
//             to: "RECEIVER_ADDRESS",
//             tokenId: "NFT_TOKEN_ID",
//             contractAddress: "NFT_CONTRACT_ADDRESS"
//         });
//         console.log("NFT Transfer Response:", nftTransferResponse.data);

//     } catch (error:any) {
//         console.error("Error:", error.response?.data || error.message);
//     }
// };
authenticate();
// main();
