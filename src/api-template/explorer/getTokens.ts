import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

/**
 * Retrieves information about the supported tokens
 * 
 * This function makes an API call to Okto's sandbox API to fetch information about the supported tokens.
 * 
 * @param OktoAuthToken - Authentication token
 * @returns Object containing details of the supported tokens
 *          to the client application. 
 * 
 * @throws Error if the API request fails.
 */
export async function getTokens(OktoAuthToken: string) {
    try {
        const response = await axios.get(
            "https://sandbox-api.okto.tech/api/oc/v1/supported/tokens",
            {
                headers: {
                    Authorization: `Bearer ${OktoAuthToken}`,
                },
            }
        );
        return response.data.data.tokens;
    } catch (error: any) {
        console.error("Error fetching tokens:", error.response?.data || error);
        throw new Error("Failed to fetch tokens");
    }
}

// Sample usage 
// const tokens = await getTokens(OktoAuthToken);
// console.log("Supported Tokens:", tokens);