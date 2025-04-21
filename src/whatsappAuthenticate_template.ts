import axios from "axios";
import { generateClientSignature } from "./utils/generateClientSignature.js";

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

export async function sendOtp() {
    const payload = {
        whatsapp_number: "82XXXXXXXX", // Replace with the user's WhatsApp number
        country_short_name: "IN", // Replace with the user's country short name
        client_swa: "0xef508a2EF36f0696E3f3C4CF3727C615EEF991ce", // Replace with your client_swa
    };

    try {
        const res = await postSignedRequest(
            "https://sandbox-api.okto.tech/api/oc/v1/authenticate/whatsapp",
            payload
        );
        console.log("OTP Sent:", res);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error (verifyOtp):", error.response?.data);
        } else {
            console.error("Unexpected error:", error);
        }
    }
}

export async function resendOtp(token: any) {
    const payload = {
        whatsapp_number: "82XXXXXXXX", // Replace with the user's WhatsApp number
        country_short_name: "IN", // Replace with the user's country short name
        token: token,
        client_swa: "0xef508a2EF36f0696E3f3C4CF3727C615EEF991ce", // Replace with your client_swa
    };

    try {
        const res = await postSignedRequest(
            "https://sandbox-api.okto.tech/api/oc/v1/authenticate/whatsapp",
            payload
        );
        console.log("OTP Resent:", res);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error (verifyOtp):", error.response?.data);
        } else {
            console.error("Unexpected error:", error);
        }
    }
}

export async function verifyOtp(token: any, otp: any) {
    const payload = {
        whatsapp_number: "82XXXXXXXX", // Replace with the user's WhatsApp number
        country_short_name: "IN", // Replace with the user's country short name
        token: token,
        otp: otp,
        client_swa: "0xef508a2EF36f0696E3f3C4CF3727C615EEF991ce",  // Replace with your client_swa
    };

    try {
        const res = await postSignedRequest(
            "https://sandbox-api.okto.tech/api/oc/v1/authenticate/whatsapp/verify",
            payload
        );
        console.log("OTP Verified:", res);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error (verifyOtp):", error.response?.data);
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
//     token: 'eb0f8e36-1998-59de-b6b4-34366abe13bb',
//     trace_id: '1f1766f4bc4536e68f64bc4dacb55f2c'
//   }
// }

/*
* Step 2 (Optional): Resend OTP
* This step is optional and can be used in case the initial OTP was not received.
* Provide the same token returned from the sendOtp() call.
*/

resendOtp("86fec014-4c1d-5a87-9297-787a7cf8565a");
// Sample Response:
// This response if for other token. that's why its is not same as one used for verifyOtp.
// OTP Resent: {
//   status: 'success',
//   data: {
//     status: 'success',
//     message: 'whatsapp otp sent',
//     code: 200,
//     token: '86fec014-4c1d-5a87-9297-787a7cf8565a',
//     trace_id: '1d0fa3b18ddf23a175cb0c06fb7f705d'
//   }
// }


/*
* Step 3: Verify OTP
* Call this method using the token from Step 1 or 2, along with the OTP received via WhatsApp.
*/

verifyOtp("eb0f8e36-1998-59de-b6b4-34366abe13bb", "332663");
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