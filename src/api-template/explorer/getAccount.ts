import axios from "axios";
import dotenv from "dotenv";
import type { GetAccountResponse } from "../helper/types.js";

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
export async function getAccount(OktoAuthToken: string): Promise<GetAccountResponse> {
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
// const account: GetAccountResponse = await getAccount(OktoAuthToken);
// console.log("Wallets :", account);

// Sample Response 
// Wallets : {
//   status: 'success',
//   data: [
//     {
//       caip_id: 'eip155:8453',
//       network_name: 'BASE',
//       address: '0x727892fD803b998d286022126660077C7fc27a29',
//       network_id: '9400de12-efc6-3e69-ab02-0eaf5aaf21e5',
//       network_symbol: 'BASE'
//     },
//     {
//       caip_id: 'aptos:testnet',
//       network_name: 'APTOS_TESTNET',
//       address: '0xaf260576bd1ffcb0fd0f1b1e11efa203d74b5f0f9e9be2c789e12ebdb1e0f0cb',
//       network_id: 'd6fd4680-c28d-37b2-994e-b9d3d4026f91',
//       network_symbol: 'APT TESTNET'
//     },
//     {
//       caip_id: 'aptos:mainnet',
//       network_name: 'APTOS',
//       address: '0xaf260576bd1ffcb0fd0f1b1e11efa203d74b5f0f9e9be2c789e12ebdb1e0f0cb',
//       network_id: 'dd50ef5f-58f4-3133-8e25-9c2673a9122f',
//       network_symbol: 'APT'
//     },
//     {
//       caip_id: 'eip155:137',
//       network_name: 'POLYGON',
//       address: '0x727892fD803b998d286022126660077C7fc27a29',
//       network_id: 'ae506585-0ba7-32f3-8b92-120ddf940198',
//       network_symbol: 'POLYGON'
//     },
//     {
//       caip_id: 'eip155:80002',
//       network_name: 'POLYGON_TESTNET_AMOY',
//       address: '0x727892fD803b998d286022126660077C7fc27a29',
//       network_id: '4adbfabd-d5e0-3d99-89e2-030eea922ed7',
//       network_symbol: 'POLYGON_TESTNET_AMOY'
//     },
//     {
//       caip_id: 'eip155:84532',
//       network_name: 'BASE_TESTNET',
//       address: '0x727892fD803b998d286022126660077C7fc27a29',
//       network_id: '8970cafe-4fc2-3a71-a7d3-77a672b749e9',
//       network_symbol: 'BASE_TESTNET'
//     }
//   ]
// }