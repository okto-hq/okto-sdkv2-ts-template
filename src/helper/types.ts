export type ByteArray = Uint8Array;
export type Address = `0x${string}`;
export type Hex = `0x${string}`;
export type Hash = `0x${string}`;
export type uint256 = bigint;

export type PackedUserOp = {
  accountGasLimits: Hex;
  callData: Hex;
  initCode: Hex;
  gasFees: Hex;
  nonce: Hex;
  paymasterAndData: Hex;
  preVerificationGas: Hex;
  sender: Address;
  signature?: Hex;
};

export type UserOp = {
  callData?: Hex;
  callGasLimit?: Hex;
  factory?: Address | undefined;
  factoryData?: Hex | undefined;
  maxFeePerGas?: Hex;
  maxPriorityFeePerGas?: Hex;
  nonce?: Hex;
  paymaster?: Address | undefined;
  paymasterData?: Hex | undefined;
  paymasterPostOpGasLimit?: Hex | undefined;
  paymasterVerificationGasLimit?: Hex | undefined;
  preVerificationGas?: Hex;
  sender?: Address;
  signature?: Hex;
  verificationGasLimit?: Hex;
};