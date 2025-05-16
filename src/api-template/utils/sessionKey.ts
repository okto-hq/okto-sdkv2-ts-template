import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";

/**
* Class used to create and manage session keys
* 
* This class provides functionality to create, manage, and use session keys. It handles both creation of 
* new random keys and importing existing private keys.
* 
* @param privKey - Optional existing private key to import. If not provided, a random private key will be generated.
*/
export class SessionKey {
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
        return new SessionKey(null);
    }
    static fromPrivateKey(privateKey: any) {
        return new SessionKey(privateKey);
    }
    verifySignature({ payload, signature }: any) {
        return secp256k1.verify(payload, signature, this.uncompressedPublicKey);
    }
}