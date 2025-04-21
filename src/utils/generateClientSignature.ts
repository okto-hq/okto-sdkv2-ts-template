import { ethers } from "ethers";

// Replace with your actual private key (Client Private Key)
// Remove '0x' prefix if it exists
const privateKey = "1b830a418c486398827ee384e2525fd5adcd628aac2ab21ffa6e14772e938c41";
const wallet = new ethers.Wallet(privateKey);

/**
 * Signs any arbitrary payload (no key sorting).
 * @param data - The payload object to sign
 * @returns {Promise<string>} - A hex signature string
 * 
 */
export async function generateClientSignature(data: Record<string, any>): Promise<string> {
    const message = JSON.stringify(data); 
    const signature = await wallet.signMessage(message);
    return signature;
}
