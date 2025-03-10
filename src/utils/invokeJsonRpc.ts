import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { serializeJSON } from "./serializeJson.js";

/**
 * Invokes the Okto authenticate JSON-RPC method
 * @param authPayload The authentication payload
 * @param endpoint The Okto RPC endpoint URL
 * @returns The authentication response
 */
export async function invokeJsonRpc(
    authPayload: any,
) {
    // Construct the request body for the authenticate JSON RPC Method
    const requestBody = {
        method: "authenticate",
        jsonrpc: "2.0",
        id: uuidv4(),
        params: [authPayload],
    };

    const serializedPayload = serializeJSON(requestBody, null);

    try {
        const response = await axios.post("https://sandbox-okto-gateway.oktostage.com/rpc", serializedPayload, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            return response;
        } else {
            throw new Error(response.data.error?.message || "Authentication failed");
        }
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.error?.message ||
            "An error occurred during authentication";

        throw new Error(errorMessage);
    }
}