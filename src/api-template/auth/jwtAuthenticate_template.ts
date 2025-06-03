/*
 * This script explains how to perform authentication on Okto using JWT and generate an okto auth token for the User
 */

import { loginUsingOAuth } from "../utils/generateOktoAuthToken.js";

export const JwtAuthenticate = async () => {
  const payload = {
    idToken: "<jwt-token>", // Replace with JWT token assigned by Client to the User
    provider: "client_jwt",
  };

  /* 
   * Okto checks the validity of the JWT token though the whilelisted endpoint provided by the Client and then generates the Okto auth token for the user
   * A sample curl used by Okto to verify the JWT token is as follows:
     curl --location 'https://sandbox-auth.okto.tech/test/client_jwt_verify' \
          --header 'authorization: Bearer pulkit+test1@gmail.com' \
   
    NOTE: The above endpoint is for testing purposes only and always returns 'success:true' for any JWT token provided.
  */
  await loginUsingOAuth(
    payload.idToken,
    payload.provider
  );
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
};

JwtAuthenticate();
