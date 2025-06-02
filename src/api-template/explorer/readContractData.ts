import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

export async function readContractData(payload: any, authToken: string) {
  try {
    const response = await axios.post(
      "https://sandbox-api.okto.tech/api/oc/v1/readContractData",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error reading contract data :", error.response?.data || error);
    throw error;
  }
}

// Sample data for BASE_TESTNET
// const data = {
//   caip2id: "eip155:84532",
//   data: {
//     contractAddress: "0x67C780648E0e2cc2b36FbCec46ABf64c34A95412",
//     abi: {
//       inputs: [],
//       name: "retrieve",
//       outputs: [
//         {
//           internalType: "uint256",
//           name: "",
//           type: "uint256",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     args: {},
//   },
// };

// Sample data for APTOS_TESTNET
// const data = {
//     "caip2Id": "aptos:testnet",
//     "data": {
//         "function": "0x1::coin::balance",
//         "typeArguments": ["0x1::aptos_coin::AptosCoin"],
//         "functionArguments": ["0x9ed7f8c95c5e2c3cb06dfbb48681b87401fabeb88b7d710db3720f7a2ca3fffc"] // 0x<user_address>
//     }
// }

// Sample Usage
const data = {
  caip2id: "eip155:84532",
  data: {
    contractAddress: "0x67C780648E0e2cc2b36FbCec46ABf64c34A95412",
    abi: {
      inputs: [],
      name: "retrieve",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    args: {},
  },
};

const response = await readContractData(data, OktoAuthToken);
console.log("rawRead response", response);
// Sample Response : {
//   "status": "success",
//   "data": [
//     <any data: response from chain>
//   ]
// }
