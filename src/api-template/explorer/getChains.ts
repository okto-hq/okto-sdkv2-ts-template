import axios from "axios";
import dotenv from "dotenv";
import type { GetChainsResponse } from "../helper/types.js";
import { Constants } from "../helper/constants.js";

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
export async function getChains(OktoAuthToken: string): Promise<GetChainsResponse> {
    try {
        const response = await axios.get(
            `${Constants.getBaseUrl()}/api/oc/v1/supported/networks`,
            {
                headers: {
                    Authorization: `Bearer ${OktoAuthToken}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error fetching supported networks:", error.response?.data || error);
        throw new Error("Failed to fetch supported networks");
    }
}

// Sample usage 
// const chains: GetChainsResponse = await getChains(OktoAuthToken);
// console.log("Supported Chains:", chains);

// Sample Response
// Supported Chains: [
//   {
//     caip_id: 'eip155:8453',
//     network_name: 'BASE',
//     chain_id: '8453',
//     logo: 'https://images.oktostage.com/token_logos/Base.jpg',
//     sponsorship_enabled: true,
//     gsn_enabled: false,
//     type: 'EVM',
//     network_id: '9400de12-efc6-3e69-ab02-0eaf5aaf21e5',
//     onramp_enabled: false,
//     whitelisted: true
//   },
//   {
//     caip_id: 'aptos:testnet',
//     network_name: 'APTOS_TESTNET',
//     chain_id: '2',
//     logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/21794.png',
//     sponsorship_enabled: true,
//     gsn_enabled: false,
//     type: 'APT',
//     network_id: 'd6fd4680-c28d-37b2-994e-b9d3d4026f91',
//     onramp_enabled: false,
//     whitelisted: true
//   },
//   {
//     caip_id: 'aptos:mainnet',
//     network_name: 'APTOS',
//     chain_id: '1',
//     logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/21794.png',
//     sponsorship_enabled: true,
//     gsn_enabled: false,
//     type: 'APT',
//     network_id: 'dd50ef5f-58f4-3133-8e25-9c2673a9122f',
//     onramp_enabled: false,
//     whitelisted: true
//   },
//   {
//     caip_id: 'eip155:84532',
//     network_name: 'BASE_TESTNET',
//     chain_id: '84532',
//     logo: '',
//     sponsorship_enabled: true,
//     gsn_enabled: false,
//     type: 'EVM',
//     network_id: '8970cafe-4fc2-3a71-a7d3-77a672b749e9',
//     onramp_enabled: false,
//     whitelisted: true
//   }
// ]