import { parse as uuidParse } from "uuid";

/**
 * Converts a UUID string to a BigInt value
 * @param nonce - UUID string to convert
 * @returns BigInt representation of the UUID
 */
export function nonceToBigInt(nonce: string): bigint {
    const uuidBytes = uuidParse(nonce); // Get the 16-byte array of the UUID
    let bigInt = BigInt(0);
    for (let i = 0; i < uuidBytes.length; i++) {
        if (uuidBytes[i] !== undefined) {
            bigInt = (bigInt << BigInt(8)) | BigInt(uuidBytes[i]!);
        }
    }
    return bigInt;
}