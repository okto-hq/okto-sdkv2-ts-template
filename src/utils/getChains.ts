import axios from "axios";

/**
 * Retrieves all the enabled networks from the Okto Client Dashboard
 * @param Okto Auth Token 
 * @returns Object containing details of all chains
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
