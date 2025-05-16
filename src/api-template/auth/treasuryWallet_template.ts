// This script shows how to create the okto auth token for the Client's Treasury Wallet SWA
// This script is intended to be run in a Node.js environment

import { getChains } from "../explorer/getChains.js";
import { getAuthorizationToken } from "../utils/getAuthorizationToken.js";
import { SessionKey } from "../utils/sessionKey.js";
import dotenv from "dotenv";

dotenv.config();
var sessionConfig;
// This function explains how to construct the payload, excute Okto Authentication and create the Okto auth Token for futhrer API usage
const OktoAuthTokenGenerator = async () => {
  // assumed to be stored by the client. Example values entered here
  const treasuryWalletSWA = "0xdb9B5bbf015047D84417df078c8F06fDb6D71b76";
  const priv = [
    156, 150, 227, 117, 91, 218, 80, 251, 105, 128, 46, 209, 189, 220, 200, 124,
    162, 40, 156, 154, 123, 217, 85, 57, 167, 84, 209, 1, 177, 69, 166, 29,
  ];

  // Convert the numeric array to a hex string
  const privKeyHex = "0x" + Buffer.from(priv).toString("hex");

  // Construct the session object using the session private key above
  const session = SessionKey.fromPrivateKey(privKeyHex);

  //construct session config using the session object and userSWA
  sessionConfig = {
    sessionPrivKey: session.privateKeyHexWith0x,
    sessionPubKey: session.uncompressedPublicKeyHexWith0x,
    treasuryWalletSWA,
  };

  // Get the authorization token using the sessionConfig object
  const authToken = await getAuthorizationToken(sessionConfig);
  console.log("Okto session authToken: ", authToken);
  // Using the above authToken (in the header as bearer token), you can now make requests to all other Okto Endpoints
  // Sample Response:
  // Okto session authToken:  eyJ0eXBlIjoiZWNkc2FfdW5jb21wcmVzc2VkIiwiZGF0YSI6eyJleHBpcmVfYXQiOjE3NDEyNjk1NjYsInNlc3Npb25fcHViX2tleSI6IjB4MDQyMDM5ZjJmMGY5MTBjNDc0YWJmZWYyOWFkMmNlODBiZjg5YTU0ZjZlMjBiODI4MWI0NTQxMzZiNmJhODYyODUwNWY4ZTFmMDllNTFiOGU1NWYxMTNhNzZlZTc5NDY0M2Q4MjA3ZmNhY2E5MjZkMzJhMDBhMzZhY2M3YmVlYjY5ZiJ9LCJkYXRhX3NpZ25hdHVyZSI6IjB4ZmE4YWE5OTAyMzRkOTA0Y2Y3ZmNhN2QxMDlmOGIzZTM0N2MyZjM2ODBiN2IyNzYzYTY4MmY5NGQyNjAyZGRkMjJhZDg2ZjhjMTgxMzllMDBkZmNiNzk3Y2RhNWUxMTQ4YzQ1YjE2Njg2YmYxMDUzMjJjNjIwYTU2MDkzZTYyODIxYyJ9
  return authToken;
};

const authToken = await OktoAuthTokenGenerator();
//you can now invoke any other Okto endpoint using the authToken generated above
//refer to our docs at docs.okto.tech/docs/openapi for API references

// Example
// Invoking a sample getChains request for the treasury wallet
if (sessionConfig) {
  const chains = await getChains(authToken);
  console.log("chains: ", chains);
}
