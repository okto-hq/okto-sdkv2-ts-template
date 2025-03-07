import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { parse as uuidParse, v4 as uuidv4 } from "uuid";
import {
  encodeAbiParameters,
  encodePacked,
  fromHex,
  keccak256,
  parseAbiParameters,
  toBytes,
  toHex as toHex2,
  type Hash,
  type Hex,
} from "viem";
import axios from "axios";
import { signMessage } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();
const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as Hash;
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;
const googleIdToken = process.env.GOOGLE_ID_TOKEN as string;

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

function nonceToBigInt(nonce: string): bigint {
  const uuidBytes = uuidParse(nonce); // Get the 16-byte array of the UUID
  let bigInt = BigInt(0);

  for (let i = 0; i < uuidBytes.length; i++) {
    if (uuidBytes[i] !== undefined) {
      bigInt = (bigInt << BigInt(8)) | BigInt(uuidBytes[i]!);
    }
  }

  return bigInt;
}

// this function is used to create paymaster information
async function generatePaymasterData(
  address: any,
  privateKey: any,
  nonce: any,
  validUntil: any,
  validAfter: any
) {
  if (validUntil instanceof Date) {
    validUntil = Math.floor(validUntil.getTime() / 1e3);
  } else if (typeof validUntil === "bigint") {
    validUntil = parseInt(validUntil.toString());
  }
  if (validAfter instanceof Date) {
    validAfter = Math.floor(validAfter.getTime() / 1e3);
  } else if (typeof validAfter === "bigint") {
    validAfter = parseInt(validAfter.toString());
  } else if (validAfter === void 0) {
    validAfter = 0;
  }
  const paymasterDataHash = keccak256(
    encodePacked(
      ["bytes32", "address", "uint48", "uint48"],
      [
        toHex2(nonceToBigInt(nonce), { size: 32 }),
        address,
        validUntil,
        validAfter,
      ]
    )
  );
  const sig = await signMessage({
    message: {
      raw: fromHex(paymasterDataHash, "bytes"),
    },
    privateKey,
  });
  const paymasterData = encodeAbiParameters(
    parseAbiParameters("address, uint48, uint48, bytes"),
    [address, validUntil, validAfter, sig]
  );
  return paymasterData;
}

// This function explains the construction of the okto auth UserOp payload
async function generateAuthPayload(
  authData: any,
  sessionKey: any,
  clientSWA: any,
  clientPriv: any
) {
  const nonce = uuidv4();
  const payload: any = {};
  payload.authData = authData;
  payload.sessionData = {};
  payload.sessionData.nonce = nonce;
  payload.sessionData.clientSWA = clientSWA;
  payload.sessionData.sessionPk = sessionKey.uncompressedPublicKeyHexWith0x;
  payload.sessionData.maxPriorityFeePerGas = "0xBA43B7400"; // constant on okto chain
  payload.sessionData.maxFeePerGas = "0xBA43B7400"; // constant on okto chain
  payload.sessionData.paymaster = "0x5408fAa7F005c46B85d82060c532b820F534437c"; // okto testnet paymaster address
  console.log("clientSWA", clientSWA);
  payload.sessionData.paymasterData = await generatePaymasterData(
    clientSWA,
    clientPriv,
    nonce,
    new Date(Date.now() + 6 * 60 * 60 * 1e3), // hours in milliseconds
    0
  );

  const message = {
    raw: toBytes(
      keccak256(
        encodeAbiParameters(parseAbiParameters("address"), [
          sessionKey.ethereumAddress,
        ])
      )
    ),
  };
  payload.sessionPkClientSignature = await signMessage({
    message,
    privateKey: clientPriv,
  });
  payload.sessionDataUserSignature = await signMessage({
    message,
    privateKey: sessionKey.privateKeyHexWith0x,
  });
  console.log("signed payload: ", payload);
  // Sample Response:
  // signed payload:  {
  //   authData: {
  //     idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjI1ZjgyMTE3MTM3ODhiNjE0NTQ3NGI1MDI5YjAxNDFiZDViM2RlOWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDkyMTQzNTM1ODE3MDMyMTg5MTUiLCJoZCI6ImNvaW5kY3guY29tIiwiZW1haWwiOiJvdmlhLnNlc2hhZHJpQGNvaW5kY3guY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJJR2ZIMUdBM0ozRjVCa0RocFR3UW9nIiwiaWF0IjoxNzQxMjYyMjcyLCJleHAiOjE3NDEyNjU4NzJ9.tmm4Cq15L2uq6QyfgvaLx4hZw474gUBeBlrvlRdmpsakzTi4jXfk_E2E6CgrVw1LD5tkplrt6WP07hH03UyH0arlX-6jJB2Ddr3xBz7UY37hMbJGDXSGoQwHIHJFBIs2NSXL1ID2Kg_-_knvVGySw1_4B_Y-HEZgiNa1hh-fj6t6z3YkASAbwd76Un_4gCQV3GjPN4tNuacMXVczDv0oMJ3wDLPzk8t3XdpLbFgdS4caond2MaqLLWhe61eJ7AzFd1URKvHkNpWIhXFFBYuOCPzWZMXTlA9LC4qfD-ts7pH33fBaT1DytW0OSY0yoGK3_57hbpjmVtQNoGqDCqlylg',
  //     provider: 'google'
  //   },
  //   sessionData: {
  //     nonce: '4bbc7b27-2ba5-4a6f-8cd6-be88e61cbf09',
  //     clientSWA: '0x71c6ac62752acea820C55de730C24805A200e1CE',
  //     sessionPk: '0x042039f2f0f910c474abfef29ad2ce80bf89a54f6e20b8281b454136b6ba8628505f8e1f09e51b8e55f113a76ee794643d8207fcaca926d32a00a36acc7beeb69f',
  //     maxPriorityFeePerGas: '0xBA43B7400',
  //     maxFeePerGas: '0xBA43B7400',
  //     paymaster: '0x5408fAa7F005c46B85d82060c532b820F534437c',
  //     paymasterData: '0x00000000000000000000000071c6ac62752acea820c55de730c24805a200e1ce0000000000000000000000000000000000000000000000000000000067c9e9830000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000418bf70d043e0f6bf76cff39946dcf59d0c3610bd4a6dbcc4f70a6898e14ef6c0140e05f25e5975f944289f38d1ddbe586d6adbfd78e103c53991f8fb848996e2b1b00000000000000000000000000000000000000000000000000000000000000'
  //   },
  //   sessionPkClientSignature: '0xe8fbb34e90b25f6a822ec8056d89983bd5e0e0edfc2a586a0afe95181ae9734e1b78b5270a09e5edaa0a5da7f559a385f1d3f445fea2e97f8ffff136b4db3a821b',
  //   sessionDataUserSignature: '0xa7bf7e7e70840951dadb6970f6cfd88ff7baf1c4533cef1a8c280cd4747fc72c592cbf23163219e4cf65c0eccf8d6a5edc9ed65f89382304b36adbd03a0b1c591b'
  // }
  // response.data.result {
  //   userSWA: '0xb8Db5F3B00997339f1FE4aD62c7a6f7467d3a8f5',
  //   nonce: '0x000000000000000000000000000000004bbc7b272ba54a6f8cd6be88e61cbf09',
  //   clientSWA: '0x71c6ac62752acea820C55de730C24805A200e1CE',
  //   sessionExpiry: 1742128164
  // }

  return payload;
}

function serializeJSON(obj: any, space: any) {
  return JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "bigint" ? value.toString() + "n" : value,
    space
  );
}

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
  // Construct the data object with the googleIdToken and the provider.
  // For testing purposes, you can generate the id token from here
  // - https://docsv2-staging.okto.tech/docs/openapi/authenticate/google-oauth/get-token-id
  const data = {
    idToken: googleIdToken,
    provider: "google",
  };

  // Create a new session key using a random private key
  const session = SessionKey.create();
  console.log("session: ", session);
  // Sample Response: Store this session pair safely for delegated access
  // session:  _SessionKey {
  //   priv: Uint8Array(32) [
  //      42,  22,  96,   6, 206, 114, 117, 231,
  //     152,  86,  24, 197, 254, 229,   5,  79,
  //     142,  74,  38, 159, 172, 154,  22, 134,
  //      62, 240, 142, 178,  50, 155,  65, 245
  //   ]
  // }

  // Generate the Auth Payload which is the userOperation for authenticate
  const authPayload = await generateAuthPayload(
    data,
    session,
    clientSWA,
    clientPrivateKey
  );

  // Construct the request body for the authenticate JSON RPC Method
  const requestBody = {
    method: "authenticate",
    jsonrpc: "2.0",
    id: uuidv4(),
    params: [authPayload],
  };

  const serliazedPayload = serializeJSON(requestBody, null);

  // invoke the JSON RPC Method for Authenticate
  // NOTE: The google ID token has a very short expiry. Please generate a new token just before running this code. You can check the expiry at jwt.io
  try {
    const response = await axios.post(
      "https://sandbox-okto-gateway.oktostage.com/rpc",
      serliazedPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      console.log("User SWA: ", response.data.result.userSWA);
      // Sample Response:
      // User SWA: 0xb8Db5F3B00997339f1FE4aD62c7a6f7467d3a8f5

      // Construct the session config object using the session key you created and the userSWA from the response
      const sessionConfig = {
        sessionPrivKey: session.privateKeyHexWith0x,
        sessionPubKey: session.uncompressedPublicKeyHexWith0x,
        userSWA: response.data.result.userSWA,
      };
      console.log("Session Config: ", sessionConfig);
      // Sample Response:
      // Session Config: {
      //   sessionPrivKey: '0x096644bf3e32614bb33961d9762d9f2b2768b4ed2e968de2b59c8148875dcec0',
      //     sessionPubKey: '0x04f8e7094449d09d932f78ca4413fbff252fbe4f99445bcc4a4d5d16c31d898f4b8b080289a906334b2bfe6379547c97c6b624afdf0bcdfab5fdfcc28d0dbb98df',
      //       userSWA: '0xb8Db5F3B00997339f1FE4aD62c7a6f7467d3a8f5'
      // }

      // Get the authorization token using the sessionConfig object
      const authToken = await getAuthorizationToken(sessionConfig);
      console.log("Okto session authToken: ", authToken);
      // Using the above authToken (in the header as bearer token), you can now make requests to the all other Okto Endpoints
      // Sample Response:
      // Okto session authToken:  eyJ0eXBlIjoiZWNkc2FfdW5jb21wcmVzc2VkIiwiZGF0YSI6eyJleHBpcmVfYXQiOjE3NDEyNjk1NjYsInNlc3Npb25fcHViX2tleSI6IjB4MDQyMDM5ZjJmMGY5MTBjNDc0YWJmZWYyOWFkMmNlODBiZjg5YTU0ZjZlMjBiODI4MWI0NTQxMzZiNmJhODYyODUwNWY4ZTFmMDllNTFiOGU1NWYxMTNhNzZlZTc5NDY0M2Q4MjA3ZmNhY2E5MjZkMzJhMDBhMzZhY2M3YmVlYjY5ZiJ9LCJkYXRhX3NpZ25hdHVyZSI6IjB4ZmE4YWE5OTAyMzRkOTA0Y2Y3ZmNhN2QxMDlmOGIzZTM0N2MyZjM2ODBiN2IyNzYzYTY4MmY5NGQyNjAyZGRkMjJhZDg2ZjhjMTgxMzllMDBkZmNiNzk3Y2RhNWUxMTQ4YzQ1YjE2Njg2YmYxMDUzMjJjNjIwYTU2MDkzZTYyODIxYyJ9
    } else {
      console.error(response.data.error.message || "Failed to get Okto token");
    }
  } catch (err: any) {
    console.error(
      err.response.data.error.message ||
      "An error occurred while fetching the Okto token"
    );
  }
};

OktoAuthTokenGenerator();
//you can now invoke any other Okto endpoint using the authToken generated above
//refer to our docs at docs.okto.tech/docs/openapi for API references
