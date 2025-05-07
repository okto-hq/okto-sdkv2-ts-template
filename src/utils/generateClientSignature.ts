import { ethers } from "ethers";
import { config } from "dotenv";

config();

const client_private_key = process.env.OKTO_CLIENT_PRIVATE_KEY as string;

// Replace with your actual private key (Client Private Key)
// Remove '0x' prefix if it exists
const privateKey = client_private_key.startsWith("0x")
  ? client_private_key.slice(2)
  : client_private_key;
const wallet = new ethers.Wallet(privateKey);

/**
 * Signs any arbitrary payload (no key sorting).
 * @param data - The payload object to sign
 * @returns {Promise<string>} - A hex signature string
 *
 */
export async function generateClientSignature(
  data: Record<string, any>
): Promise<string> {
  const message = JSON.stringify(data);
  const signature = await wallet.signMessage(message);
  return signature;
}
