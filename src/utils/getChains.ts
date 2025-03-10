import axios from "axios";

/**
 * Retrieves all the enabled networks from the Okto Client Dashboard
 * 
 * This function makes an API call to Okto's sandbox API to fetch all supported networks that have been enabled for the client application.
 * 
 * @param OktoAuthToken - Authentication token
 * 
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
    } catch (error) {
        console.error("Error fetching supported networks:", error);
        throw new Error("Failed to fetch supported networks");
    }
}
