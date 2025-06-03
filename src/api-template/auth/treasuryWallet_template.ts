// This script shows how to create the okto auth token for the Client's Treasury Wallet SWA
// This script is intended to be run in a Node.js environment

import { getChains } from "../explorer/getChains.js";
import { getTreasuryWalletAuthorizationToken } from "../utils/getTreasuryWalletAuthorizationToken.js";
import { SessionKey } from "../utils/sessionKey.js";
import dotenv from "dotenv";

dotenv.config();
var sessionConfig;

// This function explains how to construct the payload, excute Okto Authentication and create the Okto auth Token for futhrer API usage
const OktoAuthTokenGenerator = async () => {
  const treasuryWalletSWA = "0x7CE82F08d432362b16E5263eF54e665541aC8A87"; // Your treasuryWalletSWA from Okto dashboard
  const treasuryAPIkey = process.env.OKTO_TREASURY_API_KEY; // Your Treasury API Key from Okto Dashboard

  // Construct the session object using the private key above
  const session = SessionKey.fromPrivateKey(treasuryAPIkey);

  //construct session config using the session object and userSWA
  sessionConfig = {
    sessionPrivKey: session.privateKeyHexWith0x,
    sessionPubKey: session.uncompressedPublicKeyHexWith0x,
    treasuryWalletSWA,
  };

  // Get the authorization token using the sessionConfig object
  const authToken = await getTreasuryWalletAuthorizationToken(sessionConfig);
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
