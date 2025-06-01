import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

/**
 * Retrieves all the enabled networks from the Okto Client Dashboard
 * 
 * This function makes an API call to Okto's sandbox API to fetch all supported networks that have been enabled for the client application.
 * 
 * @param OktoAuthToken - Authentication token
 * @returns Object containing details of all supported blockchain networks available
 *          to the client application. 
 * 
 * @throws Error if the API request fails.
 */
export async function getChains(OktoAuthToken: string) {
    try {
        const response = await axios.get(
            "https://sandbox-api.okto.tech/api/oc/v1/supported/networks",
            {
                headers: {
                    Authorization: `Bearer ${OktoAuthToken}`,
                },
            }
        );
        return response.data.data.network;
    } catch (error: any) {
        console.error("Error fetching supported networks:", error.response?.data || error);
        throw new Error("Failed to fetch supported networks");
    }
}

// Sample usage 
// const chains = await getChains(OktoAuthToken);
// console.log("Supported Chains:", chains);