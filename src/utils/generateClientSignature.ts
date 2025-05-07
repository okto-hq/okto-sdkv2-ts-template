import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Replace with your actual private key (Client Private Key)
// Remove '0x' prefix if it exists
const privateKey = process.env.OKTO_CLIENT_PRIVATE_KEY as string;
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
