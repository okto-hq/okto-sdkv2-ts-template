import {
  encodeAbiParameters,
  encodePacked,
  fromHex,
  keccak256,
  parseAbiParameters,
  toHex,
  type Hash,
  type Hex,
} from "viem";
import { nonceToBigInt } from "../helper/nonceToBigInt.js";
import { signMessage } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as Hash;
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;

/**
 * Generates paymaster data for transactions
 *
 * @param address - The client's Smart Wallet Account (SWA) address
 * @param privateKey - The client's private key used for signing
 * @param nonce - The transaction nonce
 * @param validUntil - Timestamp until which the paymaster data is valid (in seconds)
 * @param validAfter - Timestamp after which the paymaster data becomes valid (in seconds)
 * @returns A hex string containing the encoded paymaster data including signature
 */
export async function generatePaymasterData(
  address: Hex,
  privateKey: Hex,
  nonce: string,
  validUntil: Date | number | bigint,
  validAfter: Date | number | bigint
) {
  if (validUntil instanceof Date) {
    validUntil = Math.floor(validUntil.getTime() / 1000);
  } else if (typeof validUntil === "bigint") {
    validUntil = parseInt(validUntil.toString());
  }
  if (validAfter instanceof Date) {
    validAfter = Math.floor(validAfter.getTime() / 1000);
  } else if (typeof validAfter === "bigint") {
    validAfter = parseInt(validAfter.toString());
  } else if (validAfter === void 0) {
    validAfter = 0;
  }
  const paymasterDataHash = keccak256(
    encodePacked(
      ["bytes32", "address", "uint48", "uint48"],
      [
        toHex(nonceToBigInt(nonce), { size: 32 }),
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
    privateKey: privateKey,
  });

  const paymasterData = encodeAbiParameters(
    parseAbiParameters("address, uint48, uint48, bytes"),
    [address, validUntil, validAfter, sig]
  );
  return paymasterData;
}

export async function paymasterData({ nonce, validUntil, validAfter }: any) {
  return generatePaymasterData(
    clientSWA,
    clientPrivateKey,
    nonce,
    validUntil,
    validAfter
  );
}
