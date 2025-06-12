import axios from "axios";
import dotenv from "dotenv";
import type { GetTokensResponse } from "../helper/types.js";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

/**
 * Retrieves information about the supported tokens
 *
 * This function makes an API call to Okto's sandbox API to fetch information about the supported tokens.
 *
 * @param OktoAuthToken - Authentication token
 * @returns Object containing details of the supported tokens
 *          to the client application.
 *
 * @throws Error if the API request fails.
 */
export async function getTokens(
  OktoAuthToken: string
): Promise<GetTokensResponse> {
  try {
    const response = await axios.get(
      "https://sandbox-api.okto.tech/api/oc/v1/supported/tokens",
      {
        headers: {
          Authorization: `Bearer ${OktoAuthToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching tokens:", error.response?.data || error);
    throw new Error("Failed to fetch tokens");
  }
}

// Sample usage
// const tokens: GetTokensResponse = await getTokens(OktoAuthToken);
// console.log("Supported Tokens:", tokens);

// Sample Response
// Supported Tokens : {
//   status: "success",
//   data: {
//     count: 13,
//     tokens: [
//       {
//         address: "0x1::aptos_coin::AptosCoin",
//         caip_id: "aptos:testnet",
//         symbol: "APT_TESTNET",
//         image: "https://s2.coinmarketcap.com/static/img/coins/64x64/21794.png",
//         name: "",
//         short_name: "APT",
//         id: "6ddfc36b-55d2-3b1f-8c45-4b076ae3bb9e",
//         group_id: "",
//         is_primary: false,
//         network_id: "d6fd4680-c28d-37b2-994e-b9d3d4026f91",
//         network_name: "APTOS_TESTNET",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "8",
//         precision: "8",
//       },
//       {
//         address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
//         caip_id: "eip155:8453",
//         symbol: "USDC",
//         image: "https://images.okto.tech/token_logos/USDC.png",
//         name: "USDC",
//         short_name: "USD Coin",
//         id: "62311d9f-155b-3514-95a9-0894d00e054d",
//         group_id: "6bdcec02-5987-35a0-9933-b4b5aad3f6c0",
//         is_primary: false,
//         network_id: "9400de12-efc6-3e69-ab02-0eaf5aaf21e5",
//         network_name: "BASE",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "6",
//         precision: "3",
//       },
//       {
//         address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
//         caip_id: "eip155:137",
//         symbol: "Temp USDC",
//         image: "",
//         name: "USDC",
//         short_name: "USD Coin",
//         id: "39eda9b7-d3d0-380b-b8cf-80f2b9a49e1a",
//         group_id: "b7b17b35-ddd9-31f9-80fb-e436ecc8f744",
//         is_primary: true,
//         network_id: "ae506585-0ba7-32f3-8b92-120ddf940198",
//         network_name: "POLYGON",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "6",
//         precision: "4",
//       },
//       {
//         address:
//           "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT",
//         caip_id: "aptos:mainnet",
//         symbol: "USDT",
//         image: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
//         name: "",
//         short_name: "Tether USD",
//         id: "c2e82019-4e02-3c7e-9adb-f0779a46c66d",
//         group_id: "",
//         is_primary: false,
//         network_id: "dd50ef5f-58f4-3133-8e25-9c2673a9122f",
//         network_name: "APTOS",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "6",
//         precision: "6",
//       },
//       {
//         address: "",
//         caip_id: "eip155:8453",
//         symbol: "ETH",
//         image: "",
//         name: "ETH",
//         short_name: "ETH",
//         id: "b4c9c926-99f5-356f-8100-34744ebde8b4",
//         group_id: "85c3e729-eeec-337f-868f-fd6944235d56",
//         is_primary: false,
//         network_id: "9400de12-efc6-3e69-ab02-0eaf5aaf21e5",
//         network_name: "BASE",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "18",
//         precision: "7",
//       },
//       {
//         address:
//           "0xa6684268a4ed659df78c60f8da98e2335593d17055788d4be92298be68a3c6d0",
//         caip_id: "aptos:testnet",
//         symbol: "XUHT",
//         image: "",
//         name: "",
//         short_name: "XUHT",
//         id: "7e8235ac-88bb-3b6f-9f5e-cb19794ae22e",
//         group_id: "",
//         is_primary: false,
//         network_id: "d6fd4680-c28d-37b2-994e-b9d3d4026f91",
//         network_name: "APTOS_TESTNET",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "8",
//         precision: "8",
//       },
//       {
//         address: "",
//         caip_id: "eip155:137",
//         symbol: "POL",
//         image:
//           "https://www.dextools.io/resources/tokens/logos/3/ether/0x455e53cbb86018ac2b8092fdcd39d8444affc3f6.png?1698233684",
//         name: "MATIC",
//         short_name: "Polygon Ecosystem Token",
//         id: "a9e192bb-bd18-3a47-ab07-5ecff29776e3",
//         group_id: "c885bfd2-abff-30d5-a0ba-aed6573a836d",
//         is_primary: true,
//         network_id: "ae506585-0ba7-32f3-8b92-120ddf940198",
//         network_name: "POLYGON",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "18",
//         precision: "4",
//       },
//       {
//         address: "0x1::aptos_coin::AptosCoin",
//         caip_id: "aptos:mainnet",
//         symbol: "APT",
//         image: "https://s2.coinmarketcap.com/static/img/coins/64x64/21794.png",
//         name: "",
//         short_name: "APT",
//         id: "286e53ec-8991-3f7d-a276-1484a5800ea4",
//         group_id: "",
//         is_primary: false,
//         network_id: "dd50ef5f-58f4-3133-8e25-9c2673a9122f",
//         network_name: "APTOS",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "8",
//         precision: "8",
//       },
//       {
//         address: "",
//         caip_id: "eip155:84532",
//         symbol: "WETH",
//         image: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
//         name: "",
//         short_name: "ETH",
//         id: "9a716ab4-ec6d-3d98-b085-179634642a90",
//         group_id: "fd838878-3338-318f-b357-a7b2d9264a71",
//         is_primary: false,
//         network_id: "8970cafe-4fc2-3a71-a7d3-77a672b749e9",
//         network_name: "BASE_TESTNET",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "18",
//         precision: "18",
//       },
//       {
//         address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
//         caip_id: "eip155:137",
//         symbol: "USDT",
//         image: "https://images.okto.tech/token_logos/USDT.png",
//         name: "USDT",
//         short_name: "(PoS) Tether USD",
//         id: "b5a9350d-2d00-3381-b913-ee9f989d48f7",
//         group_id: "83e77d34-88e9-3e59-a678-231fbf336b08",
//         is_primary: false,
//         network_id: "ae506585-0ba7-32f3-8b92-120ddf940198",
//         network_name: "POLYGON",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "6",
//         precision: "4",
//       },
//       {
//         address: "",
//         caip_id: "eip155:80002",
//         symbol: "MATIC",
//         image: "",
//         name: "",
//         short_name: "MATIC",
//         id: "0dd783e5-85e1-3c59-ba00-17128c45b2ac",
//         group_id: "",
//         is_primary: false,
//         network_id: "4adbfabd-d5e0-3d99-89e2-030eea922ed7",
//         network_name: "POLYGON_TESTNET_AMOY",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "18",
//         precision: "18",
//       },
//       {
//         address: "0x323e78f944A9a1FcF3a10efcC5319DBb0bB6e673",
//         caip_id: "eip155:84532",
//         symbol: "USDT",
//         image: "",
//         name: "",
//         short_name: "USDT",
//         id: "4388841c-8934-3bca-b518-b883aee7d826",
//         group_id: "",
//         is_primary: false,
//         network_id: "8970cafe-4fc2-3a71-a7d3-77a672b749e9",
//         network_name: "BASE_TESTNET",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "6",
//         precision: "6",
//       },
//       {
//         address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
//         caip_id: "eip155:80002",
//         symbol: "USDC",
//         image: "",
//         name: "",
//         short_name: "USDC",
//         id: "c15989dc-7da3-3cc4-82be-98b87a221420",
//         group_id: "",
//         is_primary: false,
//         network_id: "4adbfabd-d5e0-3d99-89e2-030eea922ed7",
//         network_name: "POLYGON_TESTNET_AMOY",
//         onramp_enabled: false,
//         whitelisted: true,
//         decimals: "6",
//         precision: "6",
//       },
//     ],
//   },
// };
