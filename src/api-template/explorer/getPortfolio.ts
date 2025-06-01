import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

/**
 * Retrieves the aggregated portfolio for the User
 * 
 * This function makes an API call to Okto's sandbox API to fetch the aggregated portfolio.
 * 
 * @param OktoAuthToken - Authentication token
 * @returns Object containing aggregated portfolio details , all the token balances and their amounts.
 * 
 * @throws Error if the API request fails.
 */
export async function getPortfolio(OktoAuthToken: string) {
    try {
        const response = await axios.get(
            "https://sandbox-api.okto.tech/api/oc/v1/aggregated-portfolio",
            {
                headers: {
                    Authorization: `Bearer ${OktoAuthToken}`,
                },
            }
        );

        console.log("Aggregated Portfolio Response:", response.data);
        console.log("Aggregated Portfolio tokens:", response.data.data.group_tokens);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching supported networks:", error.response?.data || error);
        throw new Error("Failed to fetch supported networks");
    }
}

// Sample usage
// const portfolio = await getPortfolio(OktoAuthToken);
// console.log("Aggregated Portfolio:", portfolio);

