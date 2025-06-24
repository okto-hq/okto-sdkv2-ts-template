// This script shows how to create the okto auth token for delegated access to the Okto APIs given the session private key and UserSWA
// This script is intended to be run in a Node.js environment
/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import { getChains } from "../explorer/getChains.js";
import { getAuthorizationToken } from "../utils/getAuthorizationToken.js";
import { SessionKey } from "../utils/sessionKey.js";
import dotenv from "dotenv";

dotenv.config();
var sessionConfig;
// This function explains how to construct the payload, excute Okto Authentication and create the Okto auth Token for futhrer API usage
const OktoAuthTokenGenerator = async () => {
  // The below values i.e. userSWA and sessionPrivateKey are assumed to be stored by the client when the user logs in.
  // Example values entered below are for demonstration purposes only.
  const userSWA = "0x2FAb7Eb7475F6fF9a0258F1fb4383a6aA30A18e0"; // replace with the userSWA
  const sessionPrivateKey = "0x66aa53e1a76063c5ab0bac70c660bc227f1e4d5434051b049f74e2df99516875"; // replace with the session private key captured when the user logs in to Okto

  // Construct the session object using the session private key above
  const session = SessionKey.fromPrivateKey(sessionPrivateKey);

  //construct session config using the session object and userSWA
  sessionConfig = {
    sessionPrivKey: session.privateKeyHexWith0x,
    sessionPubKey: session.uncompressedPublicKeyHexWith0x,
    userSWA,
  };

  // Get the authorization token using the sessionConfig object
  const authToken: string = await getAuthorizationToken(sessionConfig);
  console.log("Okto session authToken: ", authToken);
  // Using the above authToken (in the header as bearer token), you can now make requests to all other Okto Endpoints
  // Sample Response:
  // Okto session authToken:  eyJ0eXBlIjoiZWNkc2FfdW5jb21wcmVzc2VkIiwiZGF0YSI6eyJleHBpcmVfYXQiOjE3NDEyNjk1NjYsInNlc3Npb25fcHViX2tleSI6IjB4MDQyMDM5ZjJmMGY5MTBjNDc0YWJmZWYyOWFkMmNlODBiZjg5YTU0ZjZlMjBiODI4MWI0NTQxMzZiNmJhODYyODUwNWY4ZTFmMDllNTFiOGU1NWYxMTNhNzZlZTc5NDY0M2Q4MjA3ZmNhY2E5MjZkMzJhMDBhMzZhY2M3YmVlYjY5ZiJ9LCJkYXRhX3NpZ25hdHVyZSI6IjB4ZmE4YWE5OTAyMzRkOTA0Y2Y3ZmNhN2QxMDlmOGIzZTM0N2MyZjM2ODBiN2IyNzYzYTY4MmY5NGQyNjAyZGRkMjJhZDg2ZjhjMTgxMzllMDBkZmNiNzk3Y2RhNWUxMTQ4YzQ1YjE2Njg2YmYxMDUzMjJjNjIwYTU2MDkzZTYyODIxYyJ9
  return authToken;
};

const authToken: string = await OktoAuthTokenGenerator();
//you can now invoke any other Okto endpoint using the authToken generated above
//refer to our docs at docs.okto.tech/docs/openapi for API references

// Invoking a sample getChains request for the treasury wallet
if (sessionConfig) {
  const chains = await getChains(authToken);
  console.log("chains: ", chains);
}
