import axios from "axios";
import dotenv from "dotenv";
import { secp256k1 } from "@noble/curves/secp256k1";
import { parse as uuidParse, v4 as uuidv4 } from "uuid";
import {
  encodeAbiParameters,
  encodePacked,
  fromHex,
  keccak256,
  parseAbiParameters,
  toHex,
  toBytes,
  type Hash,
  type Hex,
} from "viem";
import { signMessage } from "viem/accounts";

dotenv.config();

const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as Hex;
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;
const googleIdToken = process.env.GOOGLE_ID_TOKEN as string;

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

async function generatePaymasterData(
  address: any,
  privateKey: any,
  nonce: any,
  validUntil: any,
  validAfter: any
) {
  if (validUntil instanceof Date) {
    validUntil = Math.floor(validUntil.getTime() / 1e3);
  } else if (typeof validUntil === "bigint") {
    validUntil = parseInt(validUntil.toString());
  }
  if (validAfter instanceof Date) {
    validAfter = Math.floor(validAfter.getTime() / 1e3);
  } else if (typeof validAfter === "bigint") {
    validAfter = parseInt(validAfter.toString());
  } else if (validAfter === void 0) {
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
    privateKey,
  });
  const paymasterData = encodeAbiParameters(
    parseAbiParameters("address, uint48, uint48, bytes"),
    [address, validUntil, validAfter, sig]
  );
  return paymasterData;
}

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

  const payload: any = {};

  //creating nonce
  const nonce = uuidv4();
  console.log("Nonce:", nonce);

  payload.authData = authData;
  payload.sessionData = {};
  payload.sessionData.nonce = nonce;
  payload.sessionData.clientSWA = clientSWA;
  payload.sessionData.sessionPk = uncompressedPublicKeyHexWith0x;
  payload.sessionData.maxPriorityFeePerGas = "0xBA43B7400"; // constant on okto chain
  payload.sessionData.maxFeePerGas = "0xBA43B7400"; //constant on okto chain
  payload.sessionData.paymaster = "0x5408fAa7F005c46B85d82060c532b820F534437c"; // constant okto testnet paymaster
  console.log("clientSWA", clientSWA);
  payload.sessionData.paymasterData = await generatePaymasterData(
    clientSWA,
    clientPriv,
    nonce,
    new Date(Date.now() + 6 * 60 * 60 * 1e3), // hours in milliseconds
    0
  );
  console.log("Okto Auth Payload:", payload);

  const privateKeyHexWith0x = `0x${Buffer.from(sessionKey).toString("hex")}`;
  const privHexString: `0x${string}` = `0x${privateKeyHexWith0x.replace(
    /^0x/,
    ""
  )}`;
  const publicKeyWithoutPrefix = uncompressedPublicKey.slice(1);
  const hash = keccak256(publicKeyWithoutPrefix);
  const ethereumAddress = `0x${Buffer.from(hash.slice(-20)).toString("hex")}`;
  const hexString: `0x${string}` = `0x${ethereumAddress.replace(/^0x/, "")}`;
  console.log("Ethereum Address:", ethereumAddress);

  const message = {
    raw: toBytes(
      keccak256(encodeAbiParameters(parseAbiParameters("address"), [hexString]))
    ),
  };

  console.log("Message:", message);

  payload.sessionPkClientSignature = await signMessage({
    message,
    privateKey: clientPriv,
  });
  payload.sessionDataUserSignature = await signMessage({
    message,
    privateKey: privHexString,
  });
  return payload;
};

const authenticate = async () => {
  try {
    //creating session key using random private key
    const session = secp256k1.utils.randomPrivateKey();
    console.log("Private Key:", session);

    //creating data payload
    const data = {
      idToken: googleIdToken,
      provider: "google",
    };

    //creating auth payload
    const authPayload = await generateAuthenticatePayload(
      data,
      session,
      clientSWA,
      clientPrivateKey
    );
    console.log("Auth signed Payload:", authPayload);

    //invoke json rpc for authenticate
    const sessionConfig = await invokeJsonRpcAuth(authPayload, session);
    console.log("Session Config:", sessionConfig);

    // if auth successfull you will need the auth token to invoke any of the other fuctions
    const authToken = await getAuthorizationToken(sessionConfig);
    console.log("Auth Token:", authToken);
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
};

async function getAuthorizationToken(sessionConfig: any) {
  const sessionPriv = sessionConfig?.sessionPrivKey;
  const sessionPub = sessionConfig?.sessionPubKey;
  if (sessionPriv === void 0 || sessionPub === void 0) {
    throw new Error("Session keys are not set");
  }
  const data = {
    expire_at: Math.round(Date.now() / 1e3) + 60 * 90,
    session_pub_key: sessionPub,
  };
  const payload = {
    type: "ecdsa_uncompressed",
    data,
    data_signature: await signMessage({
      message: JSON.stringify(data),
      privateKey: sessionPriv,
    }),
  };
  return btoa(JSON.stringify(payload));
}

function serializeJSON(obj: any, space: any) {
  return JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "bigint" ? value.toString() + "n" : value,
    space
  );
}

const invokeJsonRpcAuth = async (authPayload: any, session: any) => {
  try {
    const uncompressedPublicKey = secp256k1.getPublicKey(session, false);
    const uncompressedPublicKeyHexWith0x = `0x${Buffer.from(
      uncompressedPublicKey
    ).toString("hex")}`;
    const privateKeyHexWith0x = `0x${Buffer.from(session).toString("hex")}`;

    const requestBody = {
      method: "authenticate",
      jsonrpc: "2.0",
      id: uuidv4(),
      params: [authPayload],
    };

    const serliazedPayload = serializeJSON(requestBody, null);
    console.log("Serialized Payload:", serliazedPayload);

    const response = await axios.post(
      "https://sandbox-okto-gateway.oktostage.com/rpc",
      serliazedPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response:", response.data);

    if (response.status === 200) {
      console.log("response.data.result", response.data.result);
      const sessionConfig = {
        sessionPrivKey: privateKeyHexWith0x,
        sessionPubKey: uncompressedPublicKeyHexWith0x,
        userSWA: response.data.result.userSWA,
      };
      console.log("Session Config:", sessionConfig);

      return sessionConfig;
    } else {
      console.error(response.data.error.message || "Failed to get Okto token");
    }
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
