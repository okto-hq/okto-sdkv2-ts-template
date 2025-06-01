import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

/**
 * Retrieves information about the connected account
 * 
 * This function makes an API call to Okto's sandbox API to fetch information about the connected account.
 * 
 * @param OktoAuthToken - Authentication token
 * @returns Object containing details of the connected account
 *          to the client application. 
 * 
 * @throws Error if the API request fails.
 */
export async function getAccount(OktoAuthToken: string) {
    try {
        const response = await axios.get(
            "https://sandbox-api.okto.tech/api/oc/v1/wallets",
            {
                headers: {
                    Authorization: `Bearer ${OktoAuthToken}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error fetching account:", error.response?.data || error);
        throw new Error("Failed to fetch account");
    }
}

// Sample usage 
// const account = await getAccount(OktoAuthToken);
// console.log("Wallets :", account);