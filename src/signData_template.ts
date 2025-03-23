import dotenv from "dotenv";
import axios from "axios";
import { generateSignMessagePayload, generateUUID } from "./utils/generateSignMessagePayload.js";
import { serializeJSON } from "./helper/serializeJson.js";

// Load environment variables
dotenv.config();

// Ensure required env variables are available
const OKTO_AUTH_TOKEN = process.env.OKTO_AUTH_TOKEN;
if (!OKTO_AUTH_TOKEN) throw new Error("Missing OKTO_AUTH_TOKEN in .env");

// Types 
type UserKeys = { ecdsaKeyId: string };
type Session = {
    sessionPrivKey: `0x${string}`;
    sessionPubKey: `0x${string}`;
    userSWA: string;
};

type Client = {
    _userKeys: UserKeys;
    _sessionConfig: Session;
};

type Message = string;

async function GetUserKeys() {
    const payload = {
        method: "getUserKeys",
        jsonrpc: "2.0",
        id: generateUUID(),
        params: []
    };
    const serializedPayload = serializeJSON(payload);
    const response = await axios.post(
        "https://sandbox-okto-gateway.oktostage.com/rpc",
        serializedPayload,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OKTO_AUTH_TOKEN}`
            },
        }
    );
    return response.data.result;
}

// Sign Message via JSON RPC
async function SignMessage(signPayload: unknown) {
    const payload = {
        method: "signMessage",
        jsonrpc: "2.0",
        id: generateUUID(),
        params: [signPayload],
    };

    const serializedPayload = serializeJSON(payload);
    const response = await axios.post(
        "https://sandbox-okto-gateway.oktostage.com/rpc",
        serializedPayload,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OKTO_AUTH_TOKEN}`
            },
        }
    );
    return response.data.result;
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
    const signPayload = await generateSignMessagePayload(client._userKeys, client._sessionConfig, message, "EIP191");

    try {
        const res = await SignMessage(signPayload);
        return `0x${res[0]?.signature}`;
    } catch (error) {
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
    const signPayload = await generateSignMessagePayload(client._userKeys, client._sessionConfig, data, "EIP712");

    try {
        const res = await SignMessage(signPayload);
        return `0x${res[0]?.signature}`;
    } catch (error) {
        throw new Error(`Signing failed: ${(error as Error).message}`);
    }
}

// Session configuration that doesn't change frequently
const sessionConfig: Session = {
    sessionPrivKey: "0xf2da616fbb3dbbcba238f943134af742849c132e3caceb10f9d5f857225c00d5",
    sessionPubKey: "0x049ef7e64c18d94381d64f13b848b4ff95eef276c9eb9ecf0655b42dee81c1c45dab0194bc71a801ae33716ba631a8cdce70e9695647484b589da01e5b387a856a",
    userSWA: "0x61795557B50DC229199cE51c46935d7eC560c52F",
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
        console.error("Error:", error.message);
    }
}

main();