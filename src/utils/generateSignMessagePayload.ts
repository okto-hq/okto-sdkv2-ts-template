import crypto from "crypto";
import { canonicalize } from "json-canonicalize";
import { signMessage as signMessage3 } from "viem/accounts";
import { v4 as uuidv4 } from "uuid";

type UserKeys = { ecdsaKeyId: string };
type Session = {
    sessionPrivKey: `0x${string}`; // Viem expects a hex private key  
    sessionPubKey: `0x${string}`;
    userSWA: string;
};
type SignType = "EIP191" | "EIP712";
type message = string;

export function generateUUID() {
    return uuidv4();
}

/**
* Creates a payload for message signing.
* 
* Prepares a structured payload containing the message to be signed, authentication data, and cryptographic challenge for the signing service.
* Supports both EIP-191 standard messages and EIP-712 typed data.
* 
* @param userKeys - User's key information with ECDSA key ID
* @param session - Session data with keys and user SWA
* @param message - Message content to sign
* @param signType - Signature standard to use ("EIP191" or "EIP712")
* @returns Payload for the Okto signing service
*/
export async function generateSignMessagePayload(userKeys: UserKeys, session: Session, message: message, signType: SignType) {
  const raw_message_to_sign = {
    message,
    requestType: signType
  };
  const transaction_id = generateUUID();
  const base64_message_to_sign = {
    [transaction_id]: canonicalize(raw_message_to_sign)
  };
  const base64_message = Buffer.from(
    canonicalize(base64_message_to_sign)
  ).toString("base64");
  const setup_options = {
    t: 3,
    // Threshold; 3,5 MPC
    key_id: userKeys.ecdsaKeyId,
    message: base64_message,
    signAlg: "secp256k1"
  };
  const canonicalize_setup_options = canonicalize(setup_options);
  const sha_1 = crypto.createHash("sha256").update(canonicalize_setup_options, "utf8").digest();
  const sha_2 = crypto.createHash("sha256").update(sha_1).digest();
  const challenge = sha_2.toString("hex");
  const enc = new TextEncoder();
  const paylaod = enc.encode(
    canonicalize({
      challenge,
      setup: setup_options
    })
  );
  const sig = await signMessage3({
    message: {
      raw: paylaod
    },
    privateKey: session.sessionPrivKey
  });
  const payload = {
    data: {
      userData: {
        userSWA: session.userSWA,
            jobId: generateUUID(),
        sessionPk: session.sessionPubKey
      },
      transactions: [
        {
          transactionId: transaction_id,
          method: signType,
          signingMessage: message,
          userSessionSignature: sig
        }
      ]
    }
  };
  return payload;
}