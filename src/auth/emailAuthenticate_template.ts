import axios from "axios";
import { generateClientSignature } from "../utils/generateClientSignature.js";
import type { Hex } from "viem";
import dotenv from "dotenv";

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
    email: "abhiceles1234@gmail.com", // Replace with the user's Email ID
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
    email: "abhiceles1234@gmail.com", // Replace with the user's Email ID
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

verifyOtp("ba5677ed-8f8b-5b2f-b473-7eddcd407864", "369645"); // Replace with actual token from send/resend otp and OTP
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
