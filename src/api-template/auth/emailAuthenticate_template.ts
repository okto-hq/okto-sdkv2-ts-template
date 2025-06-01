/*
 * This script explains how to perform authentication on Okto using Email and generate an okto auth token
 */

import axios from "axios";
import { generateClientSignature } from "../utils/generateClientSignature.js";
import type { Hex } from "viem";
import dotenv from "dotenv";
import { loginUsingOAuth } from "../utils/generateOktoAuthToken.js";

dotenv.config();

const client_swa = process.env.OKTO_CLIENT_SWA as Hex;

async function postSignedRequest(endpoint: string, fullPayload: any) {
  const payloadWithTimestamp = {
    ...fullPayload,
    timestamp: Date.now() - 1000, // Adjust timestamp to avoid clock skew issues
  };

  const signature = await generateClientSignature(payloadWithTimestamp);

  const requestBody = {
    data: payloadWithTimestamp,
    client_signature: signature,
    type: "ethsign",
  };

  console.log("Request Body:");
  const response = await axios.post(endpoint, requestBody, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

/**
 * This function sends an OTP to the user's Email-Id for authentication.
 */
export async function sendOtp() {
  const payload = {
    email: "devrel@coindcx.com", // Replace with the user's Email ID
    client_swa: client_swa, // Replace with your client_swa
  };

  try {
    console.log("Calling sendOtp with payload");
    const res = await postSignedRequest(
      "https://sandbox-api.okto.tech/api/oc/v1/authenticate/email",
      payload
    );
    console.log("OTP Sent:", res);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error (sendOTP):", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

/**
 * This function verifies the OTP received via Email.
 * It should be called with the token returned from the sendOtp() call, along with the OTP received via Eamil.
 */
export async function verifyOtp(token: any, otp: any) {
  const payload = {
    email: "devrel@coindcx.com", // Replace with the user's Email ID
    token: token,
    otp: otp,
    client_swa: client_swa, // Replace with your client_swa
  };

  try {
    const res = await postSignedRequest(
      "https://sandbox-api.okto.tech/api/oc/v1/authenticate/email/verify",
      payload
    );

    console.log("OTP Verified:", res);

    const authToken = res.data.auth_token;

    return authToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error (verifyOTP):", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

// Example usage:

/*
 * Step 1: Send OTP
 * Call this method to send an OTP to the user's WhatsApp number.
 */

sendOtp();
// Sample Response:
// OTP Sent: {
//   status: 'success',
//   data: {
//     status: 'success',
//     message: 'email otp sent',
//     code: 200,
//     token: '97fe0839-eb3b-5ab1-a91a-104d879d716d',
//     trace_id: '438139c4df89c2947f709032a0789453'
//   }
// }

/*
 * Step 2: Verify OTP
 * Call this method using the token from Step 1, along with the OTP received via Email.
 */

verifyOtp("99009c41-f055-5638-86f8-a03e2cdf4f0e", "915911"); // Replace with actual token from send/resend otp and OTP
// Sample Response:
// OTP Verified: {
//   status: 'success',
//   data: {
//     auth_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2luZGN4X2lkIjoiNzE4NWQ4NWEtOTIyNC00NDkwLTliM2UtZTgzZjEyYzI0ZjE1IiwidXNlcl9pZCI6IjcxODVkODVhLTkyMjQtNDQ5MC05YjNlLWU4M2YxMmMyNGYxNSIsInNoYXJlZF9pZCI6bnVsbCwiZGN4X2NyZWF0ZWRfYXQiOm51bGwsInBvcnRmb2xpb0ZhY3RvciI6IjEiLCJhY2NUeXBlIjoid2ViMyIsImFjY291bnRfb3duZXJfaWQiOiJjNTcwMzA0Yi1hOTkwLTVkMGMtYTViZi1hYTI5ODk0ZjQ4MTciLCJzZXNzaW9uSWQiOiIwYTNlYjRiYS1iMzZiLTQ4ODQtYWQ5Ni1jMzk0ZjEwOTI1ODQiLCJ1c2VyX2xvZ2luX3ZlbmRvcl9pZCI6ImJkNjMwYWMyLWRiZjgtNGZmMS04YTNhLThjOGMxYjY3MzIzNSIsInMiOiJ3ZWIiLCJ1c2VyQWdlbnQiOiJheGlvcy8xLjguMSIsInNpcCI6IjEwNi4yMTMuODUuMjM1Iiwic2NpdHkiOiJQdW5lIiwic2NvdW50cnkiOiJJTiIsInNyZWdpb24iOiJNSCIsImxvZ2luX21lZGl1bSI6IkVNQUlMX09UUCIsImlhdCI6MTc0NjI3MzI0NiwiZXhwIjoxNzQ3MTM3MjQ2fQ.2--1KPm0UxTkTrRnQxex_JGAOetU2sOz77MzUzcLP04',
//     message: 'success',
//     refresh_auth_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2luZGN4X2lkIjoiNzE4NWQ4NWEtOTIyNC00NDkwLTliM2UtZTgzZjEyYzI0ZjE1IiwidXNlcl9pZCI6IjcxODVkODVhLTkyMjQtNDQ5MC05YjNlLWU4M2YxMmMyNGYxNSIsInNoYXJlZF9pZCI6bnVsbCwiZGN4X2NyZWF0ZWRfYXQiOm51bGwsInBvcnRmb2xpb0ZhY3RvciI6IjEiLCJhY2NUeXBlIjoid2ViMyIsImFjY291bnRfb3duZXJfaWQiOiJjNTcwMzA0Yi1hOTkwLTVkMGMtYTViZi1hYTI5ODk0ZjQ4MTciLCJzZXNzaW9uSWQiOiIwYTNlYjRiYS1iMzZiLTQ4ODQtYWQ5Ni1jMzk0ZjEwOTI1ODQiLCJ1c2VyX2xvZ2luX3ZlbmRvcl9pZCI6ImJkNjMwYWMyLWRiZjgtNGZmMS04YTNhLThjOGMxYjY3MzIzNSIsInMiOiJ3ZWIiLCJ1c2VyQWdlbnQiOiJheGlvcy8xLjguMSIsInNpcCI6IjEwNi4yMTMuODUuMjM1Iiwic2NpdHkiOiJQdW5lIiwic2NvdW50cnkiOiJJTiIsInNyZWdpb24iOiJNSCIsImxvZ2luX21lZGl1bSI6IkVNQUlMX09UUCIsInIiOiIxIiwiaWF0IjoxNzQ2MjczMjQ2LCJleHAiOjE3NDg4NjUyNDZ9.Se4lTkq6I1gfbzfBcwm8xDnVm6Zfutz8UFx3VXDHyww',
//     device_token: '8661c1f7bceccc361bed04f29563bc81345da670ba79dd13a9d46036b07b3354'
//   }
// }

/*
 * Step 3: Generate Okto Auth Token
 * This step is needed in order to generate the Okto Auth token for further API usage.
 */

loginUsingOAuth("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2luZGN4X2lkIjoiYmI4Mjc2NjktNzZjYy00NzIyLWE1Y2MtM2EyNzZlMTg2ZmM2IiwidXNlcl9pZCI6ImJiODI3NjY5LTc2Y2MtNDcyMi1hNWNjLTNhMjc2ZTE4NmZjNiIsInNoYXJlZF9pZCI6bnVsbCwiZGN4X2NyZWF0ZWRfYXQiOm51bGwsInBvcnRmb2xpb0ZhY3RvciI6IjEiLCJhY2NUeXBlIjoid2ViMyIsImFjY291bnRfb3duZXJfaWQiOiJjNTcwMzA0Yi1hOTkwLTVkMGMtYTViZi1hYTI5ODk0ZjQ4MTciLCJzZXNzaW9uSWQiOiI0NDUwYmJjNS1kMTlhLTRkMjYtOTgzZC0zZGUyMWNiMDdiNTIiLCJ1c2VyX2xvZ2luX3ZlbmRvcl9pZCI6ImJkNjMwYWMyLWRiZjgtNGZmMS04YTNhLThjOGMxYjY3MzIzNSIsInMiOiJ3ZWIiLCJ1c2VyQWdlbnQiOiJheGlvcy8xLjguMSIsInNpcCI6IjI0MDk6NDBlMzoxMDAxOjQxYzU6ZmRhODo4MWVhOjEwOWM6NDJkZSIsInNjaXR5IjoiTHVja25vdyIsInNjb3VudHJ5IjoiSU4iLCJzcmVnaW9uIjoiVVAiLCJsb2dpbl9tZWRpdW0iOiJFTUFJTF9PVFAiLCJpYXQiOjE3NDg3NDgzNTksImV4cCI6MTc0OTYxMjM1OX0.rK20rvSGzVlX8_ppQi8l-4OSllOaK7Q4hb12Ii3N9lY", "okto"); // Replace with auth_token received from the verifyOtp() response
// Sample Response
// session:  SessionKey {
//   priv: Uint8Array(32) [
//     136, 191, 211, 101, 247, 112, 179,
//     235, 195, 168, 205, 119, 185, 202,
//     208,  46, 174, 220, 120, 169, 163,
//     209,  95,  60,  10, 164,  93,  35,
//      69,  15, 240,  30
//   ]
// }
// signed payload:  {
//   authData: {
//     idToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2luZGN4X2lkIjoiNDQ3ODQ4ODItN2Q4Mi00OTQ3LTk2YTAtMWEzN2FlMGE4YzQ2IiwidXNlcl9pZCI6IjQ0Nzg0ODgyLTdkODItNDk0Ny05NmEwLTFhMzdhZTBhOGM0NiIsInNoYXJlZF9pZCI6bnVsbCwiZGN4X2NyZWF0ZWRfYXQiOm51bGwsInBvcnRmb2xpb0ZhY3RvciI6IjEiLCJhY2NUeXBlIjoid2ViMyIsImFjY291bnRfb3duZXJfaWQiOiJjNTcwMzA0Yi1hOTkwLTVkMGMtYTViZi1hYTI5ODk0ZjQ4MTciLCJzZXNzaW9uSWQiOiI5MGVkNzZjZS0wZjg5LTRiMTAtYmYyMy1lNTUwNzJjNDk1NTUiLCJ1c2VyX2xvZ2luX3ZlbmRvcl9pZCI6ImJkNjMwYWMyLWRiZjgtNGZmMS04YTNhLThjOGMxYjY3MzIzNSIsInMiOiJ3ZWIiLCJ1c2VyQWdlbnQiOiJheGlvcy8xLjguMSIsInNpcCI6IjEwNi4yMTMuODYuNTkiLCJzY2l0eSI6IlB1bmUiLCJzY291bnRyeSI6IklOIiwic3JlZ2lvbiI6Ik1IIiwibG9naW5fbWVkaXVtIjoiV0hBVFNBUFBfT1RQIiwiaWF0IjoxNzQ2MDI2MTk0LCJleHAiOjE3NDY4OTAxOTR9.Q0bekkzTfS1cNK9R3wocvVTUku8x-jwL7sV20DRUthc',
//     provider: 'okto'
//   },
//   sessionData: {
//     nonce: '598b94ab-5fcb-4cd8-a5b3-da2f35f0f61b',
//     clientSWA: '0xe8201E368557508bF183D4e2DcE1b1A1E0bd20FA',
//     sessionPk: '0x04b02f5edc4d2c23c44669a8686d66848dfa5b84f5d0c08c1387ec84b6563d9cf6591b1bb4b3357969b255e65cdbf994019f59fbabe5c3587f7a9cd526c5dd23ed',
//     maxPriorityFeePerGas: '0xBA43B7400',
//     maxFeePerGas: '0xBA43B7400',
//     paymaster: '0x74324fA6Fa67b833dfdea4C1b3A9898574d076e3',
//     paymasterData: '0x000000000000000000000000e8201e368557508bf183d4e2dce1b1a1e0bd20fa000000000000000000000000000000000000000000000000000000006812935f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041d399e7bf1218cf5b4f1df928c54c4dd78560d56826e8cd646e92a687ccb2fa2a0514cfd91eb41923d9cc99f5e7b0ae54fd5a7cac5a8cf67e59adead514109a781c00000000000000000000000000000000000000000000000000000000000000'
//   },
//   sessionPkClientSignature: '0xda23b15f04469f08c61c0356bb648532882178ae88f77e8114c7e83035ea49d4665bb75c979ef7c7243834520de046305dd241c0ecdbc916b3b3f12edc13e7db1c',
//   sessionDataUserSignature: '0xe3d1b0b9e2793a7a1d960280e1736f843cfbb405d486f3d9176f7207bc29c7911c44341ef2d54b9e5ba910f233f6ff7f9912689f30927396dc5bd9129bf796cc1c'
// }
// User SWA:  0xfE73D03c119A832bbEFC12D1289494257c03A4e1
// Session Config:  {
//   sessionPrivKey: '0x88bfd365f770b3ebc3a8cd77b9cad02eaedc78a9a3d15f3c0aa45d23450ff01e',
//   sessionPubKey: '0x04b02f5edc4d2c23c44669a8686d66848dfa5b84f5d0c08c1387ec84b6563d9cf6591b1bb4b3357969b255e65cdbf994019f59fbabe5c3587f7a9cd526c5dd23ed',
//   userSWA: '0xfE73D03c119A832bbEFC12D1289494257c03A4e1'
// }
// Okto session authToken:  eyJ0eXBlIjoiZWNkc2FfdW5jb21wcmVzc2VkIiwiZGF0YSI6eyJleHBpcmVfYXQiOjE3NDYwMzE2NDEsInNlc3Npb25fcHViX2tleSI6IjB4MDRiMDJmNWVkYzRkMmMyM2M0NDY2OWE4Njg2ZDY2ODQ4ZGZhNWI4NGY1ZDBjMDhjMTM4N2VjODRiNjU2M2Q5Y2Y2NTkxYjFiYjRiMzM1Nzk2OWIyNTVlNjVjZGJmOTk0MDE5ZjU5ZmJhYmU1YzM1ODdmN2E5Y2Q1MjZjNWRkMjNlZCJ9LCJkYXRhX3NpZ25hdHVyZSI6IjB4NjRlN2ZiOTlmNDFlOTIwZDc4ZmUxMzQxNzc0NzI2OGM2M2FmNzhkYzllNzg2NjdlM2Q2MTRkZTViMTk2MDUxYjM4NGVhNDJlNzNjNWEyZDY4N2VhYzdjZTdjYjczMjViMzNkOTNlZDAwMTQ1M2FjNDU4ZjZkYWVjYTk5NzAzNTExYiJ9
