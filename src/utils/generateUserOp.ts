import {
    encodeAbiParameters,
    keccak256,
    pad,
    parseAbiParameters,
    hexToBigInt,
    type Hex,
    concat,
} from "viem";
import { Constants } from "../helper/constants.js";

/**
 * Creates the Packed UserOp
 * @param userOp details
 * @returns userOp Object
 */
export function generatePackedUserOp(userOp: any) {
    if (!userOp.sender || !userOp.nonce || !userOp.callData || !userOp.preVerificationGas || !userOp.verificationGasLimit || !userOp.callGasLimit || !userOp.maxFeePerGas || !userOp.maxPriorityFeePerGas || userOp.paymaster == void 0 || !userOp.paymasterVerificationGasLimit || !userOp.paymasterPostOpGasLimit || userOp.paymasterData == void 0) {
        throw new Error("Invalid UserOp");
    }
    const accountGasLimits = "0x" + pad(userOp.verificationGasLimit, {
        size: 16
    }).toString().replace("0x", "") + pad(userOp.callGasLimit, {
        size: 16
    }).toString().replace("0x", "");
    const gasFees = "0x" + pad(userOp.maxFeePerGas, {
        size: 16
    }).toString().replace("0x", "") + pad(userOp.maxPriorityFeePerGas, {
        size: 16
    }).toString().replace("0x", "");
    const paymasterAndData = userOp.paymaster
        ? concat([
            userOp.paymaster,
            pad(userOp.paymasterVerificationGasLimit, { size: 16 }),
            pad(userOp.paymasterPostOpGasLimit, { size: 16 }),
            userOp.paymasterData
        ])
        : "0x";

    return {
        sender: userOp.sender,
        nonce: userOp.nonce,
        initCode: "0x",
        callData: userOp.callData,
        preVerificationGas: userOp.preVerificationGas,
        accountGasLimits,
        gasFees,
        paymasterAndData
    };
}

/**
 * Generates the userOp Hash
 * @param userOp object
 * @returns userOp hash
 */
export function generateUserOpHash(userOp: any) {
    const pack = encodeAbiParameters(
        parseAbiParameters(
            "address, bytes32, bytes32, bytes32, bytes32, uint256, bytes32, bytes32"
        ),
        [
            userOp.sender,
            pad(userOp.nonce, { size: 32 }) as `0x${string}`,
            pad(keccak256(userOp.initCode), { size: 32 }) as `0x${string}`,
            pad(keccak256(userOp.callData), { size: 32 }) as `0x${string}`,
            pad(userOp.accountGasLimits, { size: 32 }) as `0x${string}`,
            hexToBigInt(userOp.preVerificationGas),
            pad(userOp.gasFees, { size: 32 }) as `0x${string}`,
            pad(keccak256(userOp.paymasterAndData), { size: 32 })
        ]
    );

    const userOpPack = encodeAbiParameters(
        parseAbiParameters("bytes32, address, uint256"),
        [
            keccak256(pack),
            Constants.ENV_CONFIG.SANDBOX.ENTRYPOINT_CONTRACT_ADDRESS as Hex,
            BigInt(Constants.ENV_CONFIG.SANDBOX.CHAIN_ID)
        ]
    );

    return keccak256(userOpPack);
}
