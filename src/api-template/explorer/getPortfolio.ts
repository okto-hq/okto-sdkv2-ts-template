/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import axios from "axios";
import dotenv from "dotenv";
import type { GetPortfolioResponse } from "../helper/types.js";
import { Constants } from "../helper/constants.js";

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
export async function getPortfolio(OktoAuthToken: string): Promise<GetPortfolioResponse> {
    try {
        const response = await axios.get(
            `${Constants.getBaseUrl()}/api/oc/v1/aggregated-portfolio`,
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
// const portfolio: GetPortfolioResponse = await getPortfolio(OktoAuthToken);
// console.log("Aggregated Portfolio :", portfolio);

// Sample Response
// Aggregated Portfolio : {
//   status: 'success',
//   data: {
//     aggregated_data: {
//       holdings_count: '3',
//       holdings_price_inr: '162.75968',
//       holdings_price_usdt: '2.5835700000000004',
//       total_holding_price_inr: '162.75968',
//       total_holding_price_usdt: '2.5835700000000004'
//     },
//     group_tokens: [
//       {
//         id: '6ddfc36b-55d2-3b1f-8c45-4b076ae3bb9e',
//         name: 'APT',
//         symbol: 'APT_TESTNET',
//         short_name: 'APT_TESTNET',
//         token_image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/21794.png',
//         token_address: '0x1::aptos_coin::AptosCoin',
//         group_id: '',
//         network_id: 'd6fd4680-c28d-37b2-994e-b9d3d4026f91',
//         precision: '8',
//         network_name: 'APTOS_TESTNET',
//         is_primary: false,
//         balance: '1',
//         holdings_price_usdt: '0',
//         holdings_price_inr: '0',
//         aggregation_type: 'token',
//         tokens: null
//       },
//       {
//         id: 'b4c9c926-99f5-356f-8100-34744ebde8b4',
//         name: 'ETH',
//         symbol: 'ETH',
//         short_name: 'ETH',
//         token_image: '',
//         token_address: '',
//         group_id: '85c3e729-eeec-337f-868f-fd6944235d56',
//         network_id: '9400de12-efc6-3e69-ab02-0eaf5aaf21e5',
//         precision: '7',
//         network_name: 'BASE',
//         is_primary: false,
//         balance: '0.00001',
//         holdings_price_usdt: '0.02823',
//         holdings_price_inr: '1.77346',
//         aggregation_type: 'group',
//         tokens: [
//           {
//             id: 'b4c9c926-99f5-356f-8100-34744ebde8b4',
//             name: 'ETH',
//             symbol: 'ETH',
//             short_name: 'ETH',
//             token_image: '',
//             token_address: '',
//             network_id: '9400de12-efc6-3e69-ab02-0eaf5aaf21e5',
//             precision: '7',
//             network_name: 'BASE',
//             is_primary: false,
//             balance: '0.00001',
//             holdings_price_usdt: '0.02823',
//             holdings_price_inr: '1.77346'
//           }
//         ]
//       },
//       {
//         id: '9a716ab4-ec6d-3d98-b085-179634642a90',
//         name: 'ETH',
//         symbol: 'WETH',
//         short_name: 'WETH',
//         token_image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
//         token_address: '',
//         group_id: 'fd838878-3338-318f-b357-a7b2d9264a71',
//         network_id: '8970cafe-4fc2-3a71-a7d3-77a672b749e9',
//         precision: '18',
//         network_name: 'BASE_TESTNET',
//         is_primary: false,
//         balance: '0.0009597269983221',
//         holdings_price_usdt: '2.55534',
//         holdings_price_inr: '160.98622',
//         aggregation_type: 'group',
//         tokens: [
//           {
//             id: '9a716ab4-ec6d-3d98-b085-179634642a90',
//             name: 'ETH',
//             symbol: 'WETH',
//             short_name: 'WETH',
//             token_image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
//             token_address: '',
//             network_id: '8970cafe-4fc2-3a71-a7d3-77a672b749e9',
//             precision: '18',
//             network_name: 'BASE_TESTNET',
//             is_primary: false,
//             balance: '0.0009597269983221',
//             holdings_price_usdt: '2.55534',
//             holdings_price_inr: '160.98622'
//           }
//         ]
//       }
//     ]
//   }
// }
