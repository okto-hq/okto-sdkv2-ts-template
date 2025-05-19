/*
 * This script explains how to perform authentication on Okto using Whatsapp and generate an okto auth token
 */

import axios from "axios";
import { generateClientSignature } from "../utils/generateClientSignature.js";
import { type Hex } from "viem";
import dotenv from "dotenv";
import { loginUsingOAuth } from "../utils/generateOktoAuthToken.js";
dotenv.config();

const client_swa = process.env.OKTO_CLIENT_SWA as Hex;

async function postSignedRequest(endpoint: any, fullPayload: any) {
  const payloadWithTimestamp = {
    ...fullPayload,
    timestamp: Date.now(),
  };

  const signature = await generateClientSignature(payloadWithTimestamp);

  const requestBody = {
    data: payloadWithTimestamp,
    client_signature: signature,
    type: "ethsign",
  };

  const response = await axios.post(endpoint, requestBody, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

/**
 * This function sends an OTP to the user's WhatsApp number for authentication.
 */
export async function sendOtp() {
  const payload = {
    whatsapp_number: "82XXXXXXXX", // Replace with the user's WhatsApp number
    country_short_name: "IN", // Replace with the user's country short name
    client_swa: client_swa, // Replace with your client_swa
  };

  try {
    const res = await postSignedRequest(
      "https://sandbox-api.okto.tech/api/oc/v1/authenticate/whatsapp",
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
 * This function resends the OTP to the user's WhatsApp number. It is optional and can be used in case the initial OTP was not received.
 */
export async function resendOtp(token: any) {
  const payload = {
    whatsapp_number: "82XXXXXXXX", // Replace with the user's WhatsApp number
    country_short_name: "IN", // Replace with the user's country short name
    token: token,
    client_swa: client_swa, // Replace with your client_swa
  };

  try {
    const res = await postSignedRequest(
      "https://sandbox-api.okto.tech/api/oc/v1/authenticate/whatsapp",
      payload
    );
    console.log("OTP Resent:", res);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error (resendOTP):", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

/**
 * This function verifies the OTP received via WhatsApp.
 * It should be called with the token returned from the sendOtp() or resendOtp() call, along with the OTP received via WhatsApp.
 */
export async function verifyOtp(token: any, otp: any) {
  const payload = {
    whatsapp_number: "82XXXXXXXX", // Replace with the user's WhatsApp number
    country_short_name: "IN", // Replace with the user's country short name
    token: token,
    otp: otp,
    client_swa: client_swa, // Replace with your client_swa
  };

  try {
    const res = await postSignedRequest(
      "https://sandbox-api.okto.tech/api/oc/v1/authenticate/whatsapp/verify",
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
//     message: 'whatsapp otp sent',
//     code: 200,
//     token: '764f6757-9c54-5d9a-b34f-c4cf5e7b7763',
//     trace_id: '1f76c48eb32a6b247712f180a8fc4355'
//   }
// }

/*
 * Step 2 (Optional): Resend OTP
 * This step is optional and can be used in case the initial OTP was not received.
 * Provide the same token returned from the sendOtp() call.
 */

resendOtp("764f6757-9c54-5d9a-b34f-c4cf5e7b7763"); // Replace with token from the sendOtp() response
// Sample Response:
// OTP Resent: {
//   status: 'success',
//   data: {
//     status: 'success',
//     message: 'whatsapp otp sent',
//     code: 200,
//     token: '764f6757-9c54-5d9a-b34f-c4cf5e7b7763',
//     trace_id: '3cf2de940685a599558d997e772742d6'
//   }
// }

/*
 * Step 3: Verify OTP
 * Call this method using the token from Step 1 or 2, along with the OTP received via WhatsApp.
 */

verifyOtp("764f6757-9c54-5d9a-b34f-c4cf5e7b7763", "110949"); // Replace with actual token and OTP
// Sample Response:
// OTP Verified: {
//   status: 'success',
//   data: {
//     auth_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2luZGN4X2lkIjoiNjA5OTMyMGYtMTMxNC00NmJkLWFkMWUtNmY5MWU3Mjg5MGY4IiwidXNlcl9pZCI6IjYwOTkzMjBmLTEzMTQtNDZiZC1hZDFlLTZmOTFlNzI4OTBmOCIsInNoYXJlZF9pZCI6bnVsbCwiZGN4X2NyZWF0ZWRfYXQiOm51bGwsInBvcnRmb2xpb0ZhY3RvciI6IjEiLCJhY2NUeXBlIjoid2ViMyIsImFjY291bnRfb3duZXJfaWQiOiJjNTcwMzA0Yi1hOTkwLTVkMGMtYTViZi1hYTI5ODk0ZjQ4MTciLCJzZXNzaW9uSWQiOiJlYWVlNDYyZC05N2U0LTQzNTAtODg4My00MzAwNjFjMjExMGQiLCJ1c2VyX2xvZ2luX3ZlbmRvcl9pZCI6ImJkNjMwYWMyLWRiZjgtNGZmMS04YTNhLThjOGMxYjY3MzIzNSIsInMiOiJ3ZWIiLCJ1c2VyQWdlbnQiOiJheGlvcy8xLjguMSIsInNpcCI6IjEwNi4yMTMuODEuMTI2Iiwic2NpdHkiOiJQdW5lIiwic2NvdW50cnkiOiJJTiIsInNyZWdpb24iOiJNSCIsImxvZ2luX21lZGl1bSI6IldIQVRTQVBQX09UUCIsImlhdCI6MTc0NTIwODg1NSwiZXhwIjoxNzQ2MDcyODU1fQ.Lm-QJhJA2xkvNfy6Apgp10P0dVxu7PMWTxVC52sidpI',
//     message: 'success',
//     refresh_auth_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2luZGN4X2lkIjoiNjA5OTMyMGYtMTMxNC00NmJkLWFkMWUtNmY5MWU3Mjg5MGY4IiwidXNlcl9pZCI6IjYwOTkzMjBmLTEzMTQtNDZiZC1hZDFlLTZmOTFlNzI4OTBmOCIsInNoYXJlZF9pZCI6bnVsbCwiZGN4X2NyZWF0ZWRfYXQiOm51bGwsInBvcnRmb2xpb0ZhY3RvciI6IjEiLCJhY2NUeXBlIjoid2ViMyIsImFjY291bnRfb3duZXJfaWQiOiJjNTcwMzA0Yi1hOTkwLTVkMGMtYTViZi1hYTI5ODk0ZjQ4MTciLCJzZXNzaW9uSWQiOiJlYWVlNDYyZC05N2U0LTQzNTAtODg4My00MzAwNjFjMjExMGQiLCJ1c2VyX2xvZ2luX3ZlbmRvcl9pZCI6ImJkNjMwYWMyLWRiZjgtNGZmMS04YTNhLThjOGMxYjY3MzIzNSIsInMiOiJ3ZWIiLCJ1c2VyQWdlbnQiOiJheGlvcy8xLjguMSIsInNpcCI6IjEwNi4yMTMuODEuMTI2Iiwic2NpdHkiOiJQdW5lIiwic2NvdW50cnkiOiJJTiIsInNyZWdpb24iOiJNSCIsImxvZ2luX21lZGl1bSI6IldIQVRTQVBQX09UUCIsInIiOiIxIiwiaWF0IjoxNzQ1MjA4ODU1LCJleHAiOjE3NDc4MDA4NTV9.JSMV_HHRcYFprqsnxEAr-169eMwGpBYFk4G2W1Lo6WE',
//     device_token: '31910375fe7dec6658b3a7b55a2b16debb5be92473fad48f098d1bcf19f3e0a6'
//   }
// }

/*
 * Step 4: Generate Okto Auth Token
 * This step is needed in order to generate the Okto Auth token for further API usage.
 */

loginUsingOAuth("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "okto"); // Replace with actual auth_token received from the verifyOtp() response
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
