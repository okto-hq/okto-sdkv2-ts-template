// sub types
export type Status = "success" | "error";

export interface SwapperInput {
  token: string;
  amount: string;
}

export interface SwapperOutput {
  token: string;
  amount: string;
  recipient: string;
  chainId: string;
}

export interface OrderDetailsData {
  platform: string;
  platformFeeBps: string;
  orderType: string;
  swapperInputs: SwapperInput;
  swapperOutputs: SwapperOutput;
}

export interface TokenPrices {
  fromTokenPriceInUSD: string;
  toTokenPriceInUSD: string;
}

export interface StepMetadata {
  serviceType: string;
  transactionType: string;
  protocol: string;
  aggregatorName: string;
}

export interface Step {
  type: string;
  metadata: StepMetadata;
  chainId: string;
  txnData: unknown;
  intentCalldata: unknown;
}

export interface CallDataTokenPrices {
  fromTokenPriceInUSD?: string;
  toTokenPriceInUSD?: string;
}

export interface CallDataStepMetadata {
  serviceType?: "bridge" | "swap" | string;
  transactionType?: string;
  protocol?: string;
  aggregatorName?: string;
}

export interface CallDataStep {
  type?: "txn" | "intent" | string;
  metadata?: CallDataStepMetadata;
  chainId?: string;
  txnData?: unknown;
  intentCalldata?: unknown;
}

// request types

export interface GetQuoteRequest {
  fromToken: string;
  fromChain: string;
  toToken: string;
  toChain: string;
  sameChainFee?: string;
  sameChainFeeCollector?: string;
  crossChainFee?: string;
  crossChainFeeCollector?: string;
  fromAmount: string;
  slippage?: string;
  fromUserWalletAddress?: string;
  toUserWalletAddress?: string;
}

export interface GetBestRouteRequest {
  routeId?: string;
  fromToken: string;
  fromChain: string;
  toToken: string;
  toChain: string;
  sameChainFee?: string;
  sameChainFeeCollector?: string;
  crossChainFee?: string;
  crossChainFeeCollector?: string;
  fromAmount: string;
  slippage?: string;
  permitDeadline?: string;
  fromUserWalletAddress: string;
  toUserWalletAddress: string;
  advancedSettings?: unknown;
}

export interface GetCallDataRequest {
  routeId: string;
  fromToken: string;
  fromChain: string;
  toToken: string;
  toChain: string;
  sameChainFee?: string;
  sameChainFeeCollector?: string;
  crossChainFee?: string;
  crossChainFeeCollector?: string;
  fromAmount: string;
  toTokenAmountMinimum: string;
  slippage?: string;
  fromUserWalletAddress: string;
  toUserWalletAddress: string;
  permitData?: string;
  permitSignature?: string;
  advancedSettings?: unknown;
}

export interface GetOrderDetailsRequest {
  orderId: string;
  caipId: string;
}

export interface RegisterIntentRequest {
  orderBytes: string;
  orderBytesSignature: string | null;
  caipId: string;
}

// response types

export interface ErrorResponse {
  code?: number;
  errorCode?: string;
  message?: string;
  trace_id?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  status?: Status;
  error?: ErrorResponse | null;
  data?: T;
}

export interface RouteMetadata {
  protocol: string;
  aggregatorName: string;
  type: "bridge" | "swap" | string;
}

export interface GetQuoteResponseData {
  outputAmount: string;
  routeMetadata: RouteMetadata[];
  permitData?: unknown;
}

export interface IntentDetailsResponse {
  status: string;
  swapper: string;
  fillDeadline: string;
  orderData: OrderDetailsData; // Define this separately (see below)
}

export interface GetBestRouteResponse {
  routeId?: string;
  priceImpact?: string;
  isPriceImpactCalculated?: boolean;
  tokenPrices?: TokenPrices;
  feeCharged?: boolean;
  outputAmount?: string;
  steps?: Step[];
  permitDataToSign?: unknown;
  routeExpiry?: string;
}

export interface GetCallDataResponse {
  routeId?: string;
  priceImpact?: string;
  isPriceImpactCalculated?: boolean;
  tokenPrices?: CallDataTokenPrices;
  feeCharged?: boolean;
  outputAmount?: string;
  steps?: CallDataStep[];
  orderTypedData?: string;
  routeExpiry?: string;
}
