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
  payload.sessionData.maxPriorityFeePerGas = "0xBA43B7400";
  payload.sessionData.maxFeePerGas = "0xBA43B7400";
  payload.sessionData.paymaster = "0x5408fAa7F005c46B85d82060c532b820F534437c";
  console.log("clientSWA", clientSWA);
  payload.sessionData.paymasterData = await generatePaymasterData(
    clientSWA,
    clientPriv,
    nonce,
    new Date(Date.now() + 6 * 60 * 60 * 1e3),
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

const OktoAuthTokenGenerator = async () => {
  const data = {
    idToken: googleIdToken,
    provider: "google",
  };
  const session = SessionKey.create();
  console.log("session: ", session);

  const authPayload = await generateAuthPayload(
    data,
    session,
    clientSWA,
    clientPrivateKey
  );

  const requestBody = {
    method: "authenticate",
    jsonrpc: "2.0",
    id: uuidv4(),
    params: [authPayload],
  };

  const serliazedPayload = serializeJSON(requestBody, null);
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
      console.log("response.data.result", response.data.result);
      const sessionConfig = {
        sessionPrivKey: session.privateKeyHexWith0x,
        sessionPubKey: session.uncompressedPublicKeyHexWith0x,
        userSWA: response.data.result.userSWA,
      };
      const authToken = await getAuthorizationToken(sessionConfig);
      console.log("Okto session authToken: ", authToken);
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
