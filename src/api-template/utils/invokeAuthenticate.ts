import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { serializeJSON } from "../helper/serializeJson.js";

/**
 * Invokes the Okto authenticate JSON-RPC method
 *
 * This function sends an authentication request to the Okto RPC gateway.
 *
 * @param authPayload - The authentication payload object containing session, clientSWA and clientPrivateKey
 *
 * @returns The response from the authentication request if successful.
 *
 * @throws Error if authentication fails, with details about the failure.
 */
export async function invokeAuthenticate(authPayload: any) {
  // Construct the request body for the authenticate JSON RPC Method

  console.log("Request Body:", authPayload);

  try {
    const response = await axios.post(
      "https://sandbox-api.okto.tech/api/oc/v1/authenticate",
      authPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response;
    } else {
      throw new Error(response.data.error?.message || "Authentication failed");
    }
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.error?.message ||
      "An error occurred during authentication";

    console.error("Error:", err.response?.data);

    throw new Error(errorMessage);
  }
}
