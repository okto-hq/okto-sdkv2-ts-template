import axios from "axios";
import dotenv from "dotenv";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { parse as uuidParse, v4 as uuidv4 } from "uuid";
import {
  encodeAbiParameters,
  encodePacked,
  fromHex,
  keccak256,
  parseAbiParameters,
  toHex,
  type Hash,
  type Hex,
} from "viem";
import { signMessage } from "viem/accounts";

dotenv.config();

const API_BASE_URL = "https://sandbox-api.okto.tech"; // Replace with the correct base URL from OpenAPI docs
const API_KEY = ""; // will be created at the time of authenticate
const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as Hex;
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;
const OktoPaymaster = process.env.OKTO_PAYMASTER;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

function nonceToBigInt(nonce: string): bigint {
  const uuidBytes = uuidParse(nonce); // Get the 16-byte array of the UUID
  let bigInt = BigInt(0);

  for (let i = 0; i < uuidBytes.length; i++) {
    if (uuidBytes[i] !== undefined) {
      bigInt = (bigInt << BigInt(8)) | BigInt(uuidBytes[i]!);
    }
  }
  return bigInt;
}

const generatePaymasterAndData = async (
  address: Hex,
  privateKey: Hex,
  nonce: string,
  validUntil: Date | number | bigint,
  validAfter?: Date | number | bigint
): Promise<Hash> => {
  if (validUntil instanceof Date) {
    validUntil = Math.floor(validUntil.getTime() / 1000);
  } else if (typeof validUntil === "bigint") {
    validUntil = parseInt(validUntil.toString());
  }

  if (validAfter instanceof Date) {
    validAfter = Math.floor(validAfter.getTime() / 1000);
  } else if (typeof validAfter === "bigint") {
    validAfter = parseInt(validAfter.toString());
  } else if (validAfter === undefined) {
    validAfter = 0;
  }

  const paymasterDataHash = keccak256(
    encodePacked(
      ["bytes32", "address", "uint48", "uint48"],
      [
        toHex(nonceToBigInt(nonce), { size: 32 }),
        address,
        validUntil,
        validAfter,
      ]
    )
  );

  const sig = await signMessage({
    message: {
      raw: fromHex(paymasterDataHash, "bytes"),
    },
    privateKey: privateKey,
  });

  const paymasterData = encodeAbiParameters(
    parseAbiParameters("address, uint48, uint48, bytes"),
    [address, validUntil, validAfter, sig]
  );

  return paymasterData;
};

const generateAuthenticatePayload = async (
  authData: any,
  sessionKey: any,
  clientSWA: Hex,
  clientPriv: Hash
): Promise<any> => {
  const uncompressedPublicKey = secp256k1.getPublicKey(sessionKey, false);
  const uncompressedPublicKeyHexWith0x = `0x${Buffer.from(
    uncompressedPublicKey
  ).toString("hex")}`;

  //creating nonce
  const nonce = uuidv4();
  console.log("Nonce:", nonce);

  const paymasterData = await generatePaymasterAndData(
    clientSWA,
    clientPriv,
    nonce,
    new Date(Date.now() + 6 * 60 * 60 * 1000) //HOURS_in_milliseconds
  );

  const payload = {
    nonce,
    clientSWA,
    sessionPk: uncompressedPublicKeyHexWith0x,
    maxPriorityFeePerGas: "0xBA43B7400", //TODO: Get from Bundler
    maxFeePerGas: "0xBA43B7400", //TODO: Get from Bundler
    paymaster: OktoPaymaster,
    paymasterData,
  };

  return payload;
};

const authenticate = async () => {
  try {
    //creating session key using random private key
    const session = secp256k1.utils.randomPrivateKey();
    console.log("Private Key:", session);

    //creating data payload
    const data = {
      idToken: "",
      provider: "google",
    };

    //creating auth payload
    const authPayload = await generateAuthenticatePayload(
      data,
      session,
      clientSWA,
      clientPrivateKey
    );
    console.log("Auth Payload:", authPayload);

    //invoke json rpc for authenticate
    invokeJsonRpc(authPayload);
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
};

const invokeJsonRpc = async (authPayload: any) => {
  try {
    const response = await axios.post(
      "https://sandbox-okto-gateway.oktostage.com/rpc",
      {
        jsonrpc: "2.0",
        method: "authenticate",
        id: 1,
        params: [
          {
            authData: {
              idToken: "", // google id token
              provider: "google", // telegram/okto/google
            },
            sessionData: {
              // To be created at user's end
              nonce: "",
              clientSWA: "",
              sessionPk: "", // session's public key for registering this session key
              maxPriorityFeePerGas: "", // For userOp creation: pimlico_getUserOperationGasPrice from bundler
              maxFeePerGas: "", // For userOp creation: pimlico_getUserOperationGasPrice from bundler
              paymaster: "", // For userOp creation: env in code for okto paymaster contract address
              paymasterData: "", // For userOp creation
            },
            additionalData: "", // session secret key will be removed before production (this is only for testing)
            sessionPkClientSignature: "", // sign on session_data using vendor secret key
            sessionDataUserSignature: "", // sign on session_data using session secret key
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response:", response.data);
  } catch (error:any) {
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
