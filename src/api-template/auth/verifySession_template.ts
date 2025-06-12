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
const sessionData = await verifySession(OktoAuthToken);
console.log("Session Data:", sessionData);

// Sample Response
// Session Data: {
//   status: 'success',
//   data: {
//     user_id: '26f7c933-9722-4ac3-aaf3-6f2c872d02ea',
//     client_id: 'a340b202-e303-42fe-b6af-9701af55410b',
//     user_swa: '0x2FAb7Eb7475F6fF9a0258F1fb4383a6aA30A18e0',
//     client_swa: '0xdb70Faf78B19576d3C969487cb75f5152cee2E8F',
//     is_session_added: true
//   }
// }

