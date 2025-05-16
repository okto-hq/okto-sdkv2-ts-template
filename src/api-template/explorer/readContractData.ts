import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

export async function readContractData(
  payload: any,
  authToken: string
) {
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

    return response;
  } catch (error) {
    console.error("Error reading contract data :", error);
    throw error;
  }
}

// Sample data for BASE_TESTNET
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

// Sample Usage
const response = await readContractData(data, OktoAuthToken);
console.log("rawRead response", response);
// Sample Response : {
//   "status": "success",
//   "data": [
//     <any data: response from chain> 
//   ]
// }
