import dotenv from "dotenv";
import axios from "axios";
import {
  generateSignMessagePayload,
  generateUUID,
} from "../utils/generateSignMessagePayload.js";
import { serializeJSON } from "../helper/serializeJson.js";

// Load environment variables
dotenv.config();

// Ensure required env variables are available
const OKTO_AUTH_TOKEN = process.env.OKTO_AUTH_TOKEN;
if (!OKTO_AUTH_TOKEN) throw new Error("Missing OKTO_AUTH_TOKEN in .env");

// Types
type GetUserKeysResult = {
  userId: string;
  userSWA: string;
  ecdsaPublicKey: string;
  eddsaPublicKey: string;
  ecdsaKeyId: string;
  eddsaKeyId: string;
};

type Session = {
  sessionPrivKey: `0x${string}`;
  sessionPubKey: `0x${string}`;
  userSWA: string;
};

type Client = {
  _userKeys: GetUserKeysResult;
  _sessionConfig: Session;
};

type Message = string;

async function GetUserKeys() {
  const response = await axios.get(
    "https://sandbox-api.okto.tech/api/oc/v1/user-keys",
    {
      headers: {
        Authorization: `Bearer ${OKTO_AUTH_TOKEN}`,
      },
    }
  );

  console.log("getUserKeys response: ", response.data);
  return response.data.data;
}

// Sign Message via JSON RPC
async function SignMessage(signPayload: unknown) {
  console.log("signMessage request payload: ", signPayload);
  const response = await axios.post(
    "https://sandbox-api.okto.tech/api/oc/v1/signMessage",
    signPayload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OKTO_AUTH_TOKEN}`,
      },
    }
  );
  return response.data?.data;
}

/**
 * Signs a standard Ethereum message (EIP-191) using the client's keys.
 *
 * This function creates a signature for a plain text message following the Ethereum personal message signing standard (EIP-191).
 *
 * @param client - The Okto client instance containing user keys and session configuration
 * @param message - The message to sign (plain string)
 * @returns A signed message (hexadecimal string starting with "0x")
 * @throws Error if the signing process fails
 */
export async function signMessage(client: Client, message: Message) {
  // Create Payload for signing a message
  const signPayload = await generateSignMessagePayload(
    client._userKeys,
    client._sessionConfig,
    message,
    "EIP191"
  );

  try {
    const res = await SignMessage(signPayload);
    return `0x${res[0]?.signature}`;
  } catch (error: any) {
    console.error("Error signing message:", error.response?.data || error);
    throw new Error(`Signing failed: ${(error as Error).message}`);
  }
}

/**
 * Signs typed structured data according to EIP-712 standard using the client's keys.
 *
 * This function creates a signature for structured data following the EIP-712 standard, which allows for signing of typed data objects.
 *
 * @param client - The Okto client instance containing user keys and session configuration
 * @param data - The structured data to sign (EIP-712 formatted JSON string or object)
 * @returns A signed message (hexadecimal string starting with "0x")
 * @throws Error if the signing process fails or if the data is not properly formatted
 */
export async function signTypedData(client: Client, data: Message) {
  // Create Payload for signing data
  const signPayload = await generateSignMessagePayload(
    client._userKeys,
    client._sessionConfig,
    data,
    "EIP712"
  );

  try {
    const res = await SignMessage(signPayload);
    return `0x${res[0]?.signature}`;
  } catch (error) {
    throw new Error(`Signing failed: ${(error as Error).message}`);
  }
}

// Session configuration that doesn't change frequently
const sessionConfig: Session = {
  sessionPrivKey:
    "0x66aa53e1a76063c5ab0bac70c660bc227f1e4d5434051b049f74e2df99516875",
  sessionPubKey:
    "0x043d389621778ecac37ba11c085db06fb29219b09c130ef84026cf221464a3907c0e3e6a5943a6e0617ca75c32537a531f61201c4241ef44645bb154d6cec0393c",
  userSWA: "0x2FAb7Eb7475F6fF9a0258F1fb4383a6aA30A18e0",
};

const message: Message = "hello okto";
const data: Message = `{
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

async function main() {
  try {
    // Get user keys dynamically
    const userKeys = await GetUserKeys();
    console.log("User Keys: ", userKeys);

    // Create client with the fetched keys
    const client: Client = {
      _userKeys: userKeys,
      _sessionConfig: sessionConfig,
    };

    // Sign message and log the result
    const signedMessage = await signMessage(client, message);
    console.log("Signed Message: ", signedMessage);
    // Sample Response:
    // Signed Message: 0x83c701514dd434454495f514bf560904b76dec9f476cf847a2aa782546aead3b024e1f3fe69d47529384bae2d3f206d74777943f08b84dd3612dbcdd731c99f41c

    // Sign typed data and log the result
    const signedTypedData = await signTypedData(client, data);
    console.log("Signed Typed Data: ", signedTypedData);
    // Sample Response:
    // Signed Typed Data: 0x4d0a8249fc83052c17078d3c600cd4364963f0b9a866c49cbf2cda683d9552b745c53746b97f6ebe79c18f5839450ac86511ed73849fbc2d58d1319346c50e451b
  } catch (error: any) {
    console.error("Error:", error);
  }
}

main();
