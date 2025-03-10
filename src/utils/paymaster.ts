import {
    encodeAbiParameters,
    encodePacked,
    fromHex,
    keccak256,
    pad,
    parseAbiParameters,
    toHex,
    type Hash,
    type Hex
} from "viem";
import { nonceToBigInt } from "./nonceToBigInt.js";
import { signMessage } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const clientPrivateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as Hash;
const clientSWA = process.env.OKTO_CLIENT_SWA as Hex;

/*
* Generates Paymaster Data
*/
export async function generatePaymasterData(
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
        privateKey,
    });
    const paymasterData = encodeAbiParameters(
        parseAbiParameters("address, uint48, uint48, bytes"),
        [address, validUntil, validAfter, sig]
    );
    return paymasterData;
}

export async function paymasterData({
    nonce,
    validUntil,
    validAfter
}: any) {
    return generatePaymasterData(
        clientSWA,
        clientPrivateKey,
        nonce,
        validUntil,
        validAfter
    );
}


