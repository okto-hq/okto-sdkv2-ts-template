/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import axios from "axios";
import dotenv from "dotenv";
import type { GetPortfolioActivityResponse } from "../helper/types.js";
import { Constants } from "../helper/constants.js";

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
export async function getPortfolioActivity(OktoAuthToken: string): Promise<GetPortfolioActivityResponse> {
    try {
        const response = await axios.get(
            `${Constants.getBaseUrl()}/api/oc/v1/portfolio/activity`,
            {
                headers: {
                    Authorization: `Bearer ${OktoAuthToken}`,
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error("Error fetching portfolio activity:", error.response?.data || error);
        throw new Error("Failed to fetch portfolio activity");
    }
}

// Sample usage
// const portfolioActivity: GetPortfolioActivityResponse = await getPortfolioActivity(OktoAuthToken);
// console.log("Portfolio Activity:", portfolioActivity);

// Sample Response
// Portfolio Activity: {
//   status: "success",
//   data: {
//     count: 20,
//     activity: [
//       {
//         symbol: "ETH",
//         image: "",
//         name: "ETH",
//         short_name: "ETH",
//         id: "b4c9c926-99f5-356f-8100-34744ebde8b4",
//         group_id: "85c3e729-eeec-337f-868f-fd6944235d56",
//         description: "Withdraw",
//         quantity: "",
//         amount: "0.000000010000000000",
//         order_type: "EXTERNAL_TRANSFER",
//         transfer_type: "WITHDRAWAL",
//         status: true,
//         created_at: 1749649160,
//         updated_at: 1749649160,
//         timestamp: 1749649160,
//         tx_hash:
//           "0xbf721e7a8cb4ae708e552436b82085e31c0df1f9ac919e62fe5d64a323ad0c1d",
//         network_id: "9400de12-efc6-3e69-ab02-0eaf5aaf21e5",
//         network_name: "BASE",
//         network_explorer_url: "https://basescan.org/",
//         network_symbol: "BASE",
//         caip_id: "eip155:8453",
//       },
//       {
//         symbol: "ETH",
//         image: "",
//         name: "ETH",
//         short_name: "ETH",
//         id: "b4c9c926-99f5-356f-8100-34744ebde8b4",
//         group_id: "85c3e729-eeec-337f-868f-fd6944235d56",
//         description: "Withdraw",
//         quantity: "",
//         amount: "0.000000010000000000",
//         order_type: "EXTERNAL_TRANSFER",
//         transfer_type: "WITHDRAWAL",
//         status: true,
//         created_at: 1749647421,
//         updated_at: 1749647421,
//         timestamp: 1749647421,
//         tx_hash:
//           "0x0ce07e32c697d3820c208b214eac3d7ba14eac70c570d2e57e533aa16de4cbef",
//         network_id: "9400de12-efc6-3e69-ab02-0eaf5aaf21e5",
//         network_name: "BASE",
//         network_explorer_url: "https://basescan.org/",
//         network_symbol: "BASE",
//         caip_id: "eip155:8453",
//       },
//       {
//         symbol: "ETH",
//         image: "",
//         name: "ETH",
//         short_name: "ETH",
//         id: "b4c9c926-99f5-356f-8100-34744ebde8b4",
//         group_id: "85c3e729-eeec-337f-868f-fd6944235d56",
//         description: "Withdraw",
//         quantity: "",
//         amount: "0.000000010000000000",
//         order_type: "EXTERNAL_TRANSFER",
//         transfer_type: "WITHDRAWAL",
//         status: true,
//         created_at: 1749647232,
//         updated_at: 1749647232,
//         timestamp: 1749647232,
//         tx_hash:
//           "0xf1982dc89f93ad85c3cc33d114a5a898e718901306db455320c5f1cbb2b854dc",
//         network_id: "9400de12-efc6-3e69-ab02-0eaf5aaf21e5",
//         network_name: "BASE",
//         network_explorer_url: "https://basescan.org/",
//         network_symbol: "BASE",
//         caip_id: "eip155:8453",
//       },
//       {
//         symbol: "",
//         image: "",
//         name: "",
//         short_name: "",
//         id: "",
//         group_id: "",
//         description: "Deposit",
//         quantity: "",
//         amount: "5000.000000000000000000",
//         order_type: "EXTERNAL_TRANSFER",
//         transfer_type: "DEPOSIT",
//         status: true,
//         created_at: 1749630612,
//         updated_at: 1749630612,
//         timestamp: 1749630612,
//         tx_hash:
//           "0x27cb58114a38f5260b1952582b1c90f6d8e02a9b364ddb4fdd46f010a5614128",
//         network_id: "ae506585-0ba7-32f3-8b92-120ddf940198",
//         network_name: "POLYGON",
//         network_explorer_url: "https://polygonscan.com/",
//         network_symbol: "POLYGON",
//         caip_id: "eip155:137",
//       },
//     ],
//   },
// };
