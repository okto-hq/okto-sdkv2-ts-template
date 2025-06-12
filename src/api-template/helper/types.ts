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

// Intent estimate and execution types
export type ExecuteUserOpResponse = {
  status: string;
  data: {
    jobId: string;
  };
};

export type EstimateUserOpResponse = {
  status: string;
  data: {
    callData?: {
      clientSWA?: string;
      feePayerAddress?: string;
      gsn?: {
        isPossible?: boolean;
        isRequired?: boolean;
        requiredNetworks?: string[];
        tokens?: string[];
      };
      intentType?: string;
      jobId?: string;
      payload?: {
        caip2Id?: string;
        transactions?: {
          data?: string;
          from?: string;
          to?: string;
          value?: string;
        }[];
      };
      policies?: {
        gsnEnabled?: boolean;
        sponsorshipEnabled?: boolean;
      };
      userSWA?: string;
    };
    details?: {
      estimation?: {
        amount?: string;
        crossChainFee?: string;
        crossChainFeeCollector?: string;
        gasFeesInInputToken?: string;
        integratorFeesInInputToken?: string;
        outputAmount?: string;
        platformBaseFeesInInputToken?: string;
        recommendedSlippage?: string;
        routeId?: string;
        routeValidUntil?: string;
        sameChainFee?: string;
        sameChainFeeCollector?: string;
        slippageUsed?: string;
        totalFeesInInputToken?: string;
      };
      fees?: {
        approxTransactionFeesInUSDT?: string;
        transactionFees?: {
          [key: string]: string;
        };
      };
      swapFees?: {
        gasFeesInInputToken?: string;
        integratorFeesInInputToken?: string;
        platformBaseFeesInInputToken?: string;
        totalFeesInInputToken?: string;
      };
    };
    userOps?: {
      callData?: string;
      callGasLimit?: string;
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
      nonce?: string;
      paymaster?: string;
      paymasterData?: string;
      paymasterPostOpGasLimit?: string;
      paymasterVerificationGasLimit?: string;
      preVerificationGas?: string;
      sender?: string;
      verificationGasLimit?: string;
    };
  };
};

// Explorer types
export type GetAccountResponse = {
  status: string;
  data: {
    caip_id: string;
    network_name: string;
    address: string;
    network_id: string;
    network_symbol: string;
  }[];
};

export type GetChainsResponse = {
  status: string;
  data: {
    network: {
      caip_id: string;
      network_name: string;
      chain_id: string;
      logo: string;
      sponsorship_enabled: boolean;
      gsn_enabled: boolean;
      type: string;
      network_id: string;
      onramp_enabled: boolean;
      whitelisted: boolean;
    }[];
  };
};

export type GetPortfolioResponse = {
  status: string;
  data: {
    aggregated_data: {
      holdings_count: string;
      holdings_price_inr: string;
      holdings_price_usdt: string;
      total_holding_price_inr: string;
      total_holding_price_usdt: string;
    };
    group_tokens: {
      id: string;
      name: string;
      symbol: string;
      short_name: string;
      token_image: string;
      token_address: string;
      group_id: string;
      network_id: string;
      precision: string;
      network_name: string;
      is_primary: boolean;
      balance: string;
      holdings_price_usdt: string;
      holdings_price_inr: string;
      aggregation_type: string;
      tokens: {
        id: string;
        name: string;
        symbol: string;
        short_name: string;
        token_image: string;
        token_address: string;
        network_id: string;
        precision: string;
        network_name: string;
        is_primary: boolean;
        balance: string;
        holdings_price_usdt: string;
        holdings_price_inr: string;
      }[];
    }[];
  };
};

export type GetPortfolioActivityResponse = {
  status: string;
  data: {
    count: number;
    activity: {
      symbol: string;
      image: string;
      name: string;
      short_name: string;
      id: string;
      group_id: string;
      description: string;
      quantity: string;
      amount: string;
      order_type: string;
      transfer_type: string;
      status: boolean;
      created_at: number;
      updated_at: number;
      timestamp: number;
      tx_hash: string;
      network_id: string;
      network_name: string;
      network_explorer_url: string;
      network_symbol: string;
      caip_id: string;
    }[];
  };
};

export type GetTokensResponse = {
  status: string;
  data: {
    count: number;
    tokens: {
      address: string;
      caip_id: string;
      symbol: string;
      image: string;
      name: string;
      short_name: string;
      id: string;
      group_id: string;
      is_primary: boolean;
      network_id: string;
      network_name: string;
      onramp_enabled: boolean;
      whitelisted: boolean;
      decimals: string;
      precision: string;
    }[];
  };
};

export type ReadContractResponse = {
  status: string;
  data: string[];
};

// Auth types
export type AuthenticateResponse = {
  status: string;
  data: {
    userSWA: string;
    nonce: string;
    clientSWA: string;
    sessionExpiry: number;
  };
};

export type SendOTPResponse = {
  status: string;
  data: {
    status: string;
    message: string;
    code: number;
    token: string;
    trace_id: string;
  };
};

export type VerifyOTPResponse = {
  status: string;
  data: {
    auth_token: string;
    message: string;
    refresh_auth_token: string;
    device_token: string;
  };
}
 
