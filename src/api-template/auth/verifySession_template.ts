import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

/**
 * Retrieves the session data for the User
 * 
 * This function makes an API call to Okto's sandbox API to fetch the session data.
 * 
 * @param OktoAuthToken - Authentication token
 * @returns Object containing following session details:
 *                  status: success if the user is logged in, failed otherwise
 *                  data:     
 *                      "user_id": "",
                        "vendor_id": "",
                        "user_swa": "",
                        "vendor_swa": "",
                        "is_session_added": ,
                        "sign_auth_relayer_user_ops": ""


 *          - status: success if the user is logged in, failed otherwise.
 * 
 * 
 * @throws Error if the API request fails.
 */
export async function verifySession(OktoAuthToken: string) {
    try {
        const response = await axios.get(
            "https://sandbox-api.okto.tech/api/oc/v1/verify-session",
            {
                headers: {
                    Authorization: `Bearer ${OktoAuthToken}`,
                },
            }
        );

        
        return response.data;
    } catch (error) {
        console.error("Error fetching session information:", error);
        throw new Error("Failed to fetch session information");
    }
}

// Sample usage
// const sessionData = await verifySession(OktoAuthToken);

