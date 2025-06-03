import { v4 as uuidv4 } from "uuid";
import axios from "axios";

/**
 * Estimates a user operation
 *
 * This function sends the payload to Okto's gateway for estimation
 * using a JSON-RPC request.
 *
 * @param userop - The user operation object containing all transaction details
 * @param authToken - Authentication token for Okto's API, generated from getAuthorizationToken
 *
 * @returns Estimate response along with unsigned userOp object
 *
 */
export async function estimateUserOp(payload: any, authToken: string) {

  try {
    console.log("estimate request payload: ");
    console.dir(payload, { depth: null });
    
    console.log("finally sending the axios request for estimate...........");
    
    const response = await axios.post(
      "https://sandbox-api.okto.tech/api/oc/v1/estimate",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.error?.message ||
      "An error occurred during estimateUserOp";

    console.error("Error estimating user operation:", err.response?.data);
    throw new Error(errorMessage);
  }
}

export async function swapEstimateUserOp(requestBody: any, authToken: string) {
  try {
    const swapPayload = requestBody;

    console.log("finally sending the axios request ...........");
    const response = await axios.post(
      "https://sandbox-api.okto.tech/api/oc/v1/estimate", // Okto 3pBFF url
      swapPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error executing user operation:", error);
    throw error;
  }
}