import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { signMessage } from "viem/accounts";
import { fromHex } from "viem";
import { generatePackedUserOp, generateUserOpHash } from "./generateUserOp.js";
import { serializeJSON } from "../helper/serializeJson.js";

export interface SessionConfig {
    sessionPrivKey: string;
    sessionPubkey: string;
    userSWA: string;
}


/**
 * Signs a user operation with the provided session private key
 */
export async function signUserOp(userop: any, sessionConfig: SessionConfig) {
    const privateKey = sessionConfig.sessionPrivKey as `0x${string}`;
    const packeduserop = generatePackedUserOp(userop);
    const hash = generateUserOpHash(packeduserop);
    const sig = await signMessage({
        message: {
            raw: fromHex(hash, "bytes")
        },
        privateKey
    });
    userop.signature = sig;
    return userop;
}

/**
 * Executes a signed user operation and returns the job ID
 */
export async function executeUserOp(userop: any, authToken: string) {
    try {
        const requestBody = {
            method: "execute",
            jsonrpc: "2.0",
            id: uuidv4(),
            params: [userop],
        };

        const serializedPayload = serializeJSON(requestBody);
        const response = await axios.post(
            "https://sandbox-okto-gateway.oktostage.com/rpc",
            serializedPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
            }
        );

        return response.data.result.jobId;
    } catch (error) {
        console.error("Error executing user operation:", error);
        throw error;
    }
}