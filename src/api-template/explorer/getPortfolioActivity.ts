import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

/**
 * Retrieves the portfolio activity for the User
 * 
 * This function makes an API call to Okto's sandbox API to fetch the portfolio activity of the user.
 * 
 * @param OktoAuthToken - Authentication token
 * @returns Object containing portfolio activity details 
 * 
 * @throws Error if the API request fails.
 */
export async function getPortfolioActivity(OktoAuthToken: string) {
    try {
        const response = await axios.get(
            "https://sandbox-api.okto.tech/api/oc/v1/portfolio/activity",
            {
                headers: {
                    Authorization: `Bearer ${OktoAuthToken}`,
                },
            }
        );

        console.log("Aggregated Portfolio Response:", response.data);
        console.log("Aggregated Portfolio tokens:", response.data.data.group_tokens);
        return response.data.data.activity;
    } catch (error: any) {
        console.error("Error fetching portfolio activity:", error.response?.data || error);
        throw new Error("Failed to fetch portfolio activity");
    }
}

// Sample usage
// const portfolioActivity = await getPortfolioActivity(OktoAuthToken);
// console.log("Portfolio Activity:", portfolioActivity);

