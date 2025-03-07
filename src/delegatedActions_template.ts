// This script shows how to create the okto auth token for delegated access to the Okto APIs given the session private key and UserSWA
// This script is intended to be run in a Node.js environment

import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { signMessage } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

var SessionKey = class _SessionKey {
  priv;
  constructor(privKey: any) {
    if (privKey) {
      this.priv = Uint8Array.from(
        Buffer.from(privKey.replace("0x", ""), "hex")
      );
    } else {
      this.priv = secp256k1.utils.randomPrivateKey();
    }
  }
  get privateKey() {
    return this.priv;
  }
  get uncompressedPublicKey() {
    return secp256k1.getPublicKey(this.priv, false);
  }
  get compressedPublicKey() {
    return secp256k1.getPublicKey(this.priv, true);
  }
  get privateKeyHex() {
    return Buffer.from(this.priv).toString("hex");
  }
  get uncompressedPublicKeyHex() {
    return Buffer.from(this.uncompressedPublicKey).toString("hex");
  }
  get privateKeyHexWith0x() {
    return `0x${Buffer.from(this.priv).toString("hex")}`;
  }
  get uncompressedPublicKeyHexWith0x() {
    return `0x${Buffer.from(this.uncompressedPublicKey).toString("hex")}`;
  }
  get ethereumAddress() {
    const publicKeyWithoutPrefix = this.uncompressedPublicKey.slice(1);
    const hash = keccak_256(publicKeyWithoutPrefix);
    return `0x${Buffer.from(hash.slice(-20)).toString("hex")}`;
  }
  static create() {
    return new _SessionKey(null);
  }
  static fromPrivateKey(privateKey: any) {
    return new _SessionKey(privateKey);
  }
  verifySignature({ payload, signature }: any) {
    return secp256k1.verify(payload, signature, this.uncompressedPublicKey);
  }
};

// this function is used to create the Okto Auth Token after successfull authentication
async function getAuthorizationToken(sessionConfig: any) {
  const sessionPriv = sessionConfig?.sessionPrivKey;
  const sessionPub = sessionConfig?.sessionPubKey;
  if (sessionPriv === void 0 || sessionPub === void 0) {
    throw new Error("Session keys are not set");
  }
  const data = {
    expire_at: Math.round(Date.now() / 1e3) + 60 * 90,
    session_pub_key: sessionPub,
  };

  // Okto auth token is nothing but the session public key encrypted with the session private key
  const payload = {
    type: "ecdsa_uncompressed",
    data,
    data_signature: await signMessage({
      message: JSON.stringify(data),
      privateKey: sessionPriv,
    }),
  };
  return btoa(JSON.stringify(payload));
}

// This function explains how to construct the payload, excute Okto Authentication and create the Okto auth Token for futhrer API usage
const OktoAuthTokenGenerator = async () => {
  // assumed to be stored by the client
  const userSWA = "0xb8Db5F3B00997339f1FE4aD62c7a6f7467d3a8f5";
  const priv = [
    42, 22, 96, 6, 206, 114, 117, 231, 152, 86, 24, 197, 254, 229, 5, 79, 142,
    74, 38, 159, 172, 154, 22, 134, 62, 240, 142, 178, 50, 155, 65, 245,
  ];

  // Construct the session object using the session private key above
  const session = SessionKey.fromPrivateKey(priv);

  //construct session config using the session object and userSWA
  const sessionConfig = {
    sessionPrivKey: session.privateKeyHexWith0x,
    sessionPubKey: session.uncompressedPublicKeyHexWith0x,
    userSWA,
  };

  // Get the authorization token using the sessionConfig object
  const authToken = await getAuthorizationToken(sessionConfig);
  console.log("Okto session authToken: ", authToken);
  // Using the above authToken (in the header as bearer token), you can now make requests to the all other Okto Endpoints
  // Sample Response:
  // Okto session authToken:  eyJ0eXBlIjoiZWNkc2FfdW5jb21wcmVzc2VkIiwiZGF0YSI6eyJleHBpcmVfYXQiOjE3NDEyNjk1NjYsInNlc3Npb25fcHViX2tleSI6IjB4MDQyMDM5ZjJmMGY5MTBjNDc0YWJmZWYyOWFkMmNlODBiZjg5YTU0ZjZlMjBiODI4MWI0NTQxMzZiNmJhODYyODUwNWY4ZTFmMDllNTFiOGU1NWYxMTNhNzZlZTc5NDY0M2Q4MjA3ZmNhY2E5MjZkMzJhMDBhMzZhY2M3YmVlYjY5ZiJ9LCJkYXRhX3NpZ25hdHVyZSI6IjB4ZmE4YWE5OTAyMzRkOTA0Y2Y3ZmNhN2QxMDlmOGIzZTM0N2MyZjM2ODBiN2IyNzYzYTY4MmY5NGQyNjAyZGRkMjJhZDg2ZjhjMTgxMzllMDBkZmNiNzk3Y2RhNWUxMTQ4YzQ1YjE2Njg2YmYxMDUzMjJjNjIwYTU2MDkzZTYyODIxYyJ9
};

OktoAuthTokenGenerator();
//you can now invoke any other Okto endpoint using the authToken generated above
//refer to our docs at docs.okto.tech/docs/openapi for API references
