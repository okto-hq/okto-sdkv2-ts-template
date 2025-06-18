# Okto SDK TypeScript Template

This repository serves as a template for working with the Okto SDK in TypeScript. It provides two main approaches for integrating with Okto:

1. **TypeScript SDK Integration** - A simple, direct way to interact with Okto services
2. **Direct API Integration** - Detailed examples for direct API interactions with Okto

## Features

- 🔐 **Authentication** with Google Sign-In
- 💼 **Wallet Management** for crypto assets
- 💸 **Token Transfers** for sending tokens
- 🖼️ **NFT Transfers** for sending NFTs
- 📝 **Raw Transaction** support for custom blockchain interactions
- 🔑 **Delegated Actions** for advanced use cases

## TypeScript SDK Usage

The main entry point for the TypeScript SDK is [`src/index.ts`](src/index.ts). This file demonstrates how to:

- Initialize the Okto client
- Authenticate users with Google OAuth
- Retrieve wallet information
- Check portfolio balances
- Get supported chains and tokens
- Transfer tokens and NFTs

To use the TypeScript SDK in your own project, simply import the required functions from the Okto SDK package:

```typescript
import { OktoClient } from "@okto_web3/core-js-sdk";
import { tokenTransfer, nftTransfer } from "@okto_web3/core-js-sdk/userop";
```

For more details on how to use the TypeScript SDK, please refer to the [TypeScript SDK Setup Guide](https://docs.okto.tech/docs/typescript-sdk).

## Direct API Integration

This template provides detailed examples for direct API integration with Okto. The examples are organized in the following structure:

### API Template (`src/api-template/`)
- `auth/` - Authentication and token generation
- `intents/` - Implementation of various intents:
  - Token transfers
  - NFT transfers
  - Raw transactions
- `utils/` - Okto-specific utility functions
- `helper/` - Generic helper functions
- `explorer/` - Blockchain explorer integration

### TypeScript SDK Template (`src/ts-template/`)
- `index.ts` - Main entry point demonstrating SDK usage

### Trade Service (`src/trade-service/`)
- `api/` - Trading API integration
- `utils/` - Trading-specific utilities
- `index.ts` - Main trading service implementation

Each implementation contains detailed comments explaining the steps and best practices.

### API Integration Process

1. **Authentication**: First, authenticate and generate an auth token using the process in `oktoAuthenticate_template.ts`
2. **Perform Actions**: After authentication, you can perform any of the following actions:
   - Token transfers
   - NFT transfers
   - Raw transactions
   - Delegated actions

## Helper and Utility Functions

The repository includes several helper and utility functions:

- **Helper Functions** ([`src/helper/`](src/helper/)): Generic functions for data conversion, serialization, and encoding
- **Utility Functions** ([`src/utils/`](src/utils/)): Okto-specific functions for generating paymaster data, session keys, and other Okto-related operations

## Environment Variables

The following environment variables are required:

```
# Okto environment ("sandbox" or "production")
OKTO_ENVIRONMENT=sandbox

# Okto API credentials (from Developer Dashboard)
OKTO_CLIENT_PRIVATE_KEY=
OKTO_CLIENT_SWA=

# Google authentication (optional, only for Google auth)
GOOGLE_ID_TOKEN=

# For testing intents or delegated access
USER_SWA=
SESSION_PUBLIC_KEY=
SESSION_PRIVATE_KEY=
OKTO_AUTH_TOKEN=
```

## Contributing

Contributions are welcome! Please take a moment to review our [CONTRIBUTING.md](CONTRIBUTING.md) guidelines before submitting any Pull Requests. Your contributions are invaluable to the Okto community.

## Learn More

- [Okto Documentation](https://docs.okto.tech/)
- [Okto Developer Dashboard](https://dashboard.okto.tech/login)
- For support, join the [Okto Discord Server](https://discord.com/invite/okto)

## Template Directories and Use Cases

### 1. TypeScript SDK Template (`src/ts-template/`)
This template demonstrates how to use the Okto TypeScript SDK for common operations:
- **Authentication**: Multiple login methods (Google OAuth, Email, WhatsApp, JWT)
- **Wallet Management**: View and manage crypto wallets
- **Portfolio Management**: Check balances, view activity, and manage NFTs
- **Token Operations**: Transfer tokens and NFTs
- **Message Signing**: Support for both EIP-191 and EIP-712 message signing
- **Order History**: Track and manage trading orders

### 2. API Template (`src/api-template/`)
This template provides low-level API integration examples for advanced use cases:

#### Authentication (`auth/`)
Handles user authentication flows, token generation, and session management for secure access to Okto services.

- [`googleAuthenticate_template.ts`](src/api-template/auth/googleAuthenticate_template.ts) - Google OAuth authentication implementation
- [`appleAuthenticate_template.ts`](src/api-template/auth/appleAuthenticate_template.ts) - Apple Sign-In authentication implementation
- [`twitterAuthenticate_template.ts`](src/api-template/auth/twitterAuthenticate_template.ts) - Twitter authentication implementation
- [`whatsappAuthenticate_template.ts`](src/api-template/auth/whatsappAuthenticate_template.ts) - WhatsApp OTP-based authentication
- [`emailAuthenticate_template.ts`](src/api-template/auth/emailAuthenticate_template.ts) - Email OTP-based authentication
- [`jwtAuthenticate_template.ts`](src/api-template/auth/jwtAuthenticate_template.ts) - JWT-based authentication
- [`verifySession_template.ts`](src/api-template/auth/verifySession_template.ts) - Session verification and management
- [`delegatedActions_template.ts`](src/api-template/auth/delegatedActions_template.ts) - Delegated action implementation
- [`treasuryWallet_template.ts`](src/api-template/auth/treasuryWallet_template.ts) - Treasury wallet management

#### Intents (`intents/`)
Implements various blockchain operations like token transfers, NFT transfers, raw transactions, and swap operations with support for gas estimation.

- [`tokenTransfer.ts`](src/api-template/intents/tokenTransfer.ts) - Basic token transfer implementation
- [`tokenTransfer_with_estimate.ts`](src/api-template/intents/tokenTransfer_with_estimate.ts) - Token transfer with gas estimation
- [`nftTransfer.ts`](src/api-template/intents/nftTransfer.ts) - Basic NFT transfer implementation
- [`nftTransfer_with_estimate.ts`](src/api-template/intents/nftTransfer_with_estimate.ts) - NFT transfer with gas estimation
- [`rawTransaction.ts`](src/api-template/intents/rawTransaction.ts) - Raw transaction implementation
- [`rawTransaction_with_estimate.ts`](src/api-template/intents/rawTransaction_with_estimate.ts) - Raw transaction with gas estimation
- [`swapIntent.ts`](src/api-template/intents/swapIntent.ts) - Token swap implementation
- [`signData_template.ts`](src/api-template/intents/signData_template.ts) - Message and typed data signing

#### Utilities (`utils/`)
Provides essential tools for blockchain operations including paymaster integration, session key management, and transaction encoding/decoding.

- [`generateUserOp.ts`](src/api-template/utils/generateUserOp.ts) - User operation generation
- [`getAuthorizationToken.ts`](src/api-template/utils/getAuthorizationToken.ts) - Authorization token generation
- [`getOrderHistory.ts`](src/api-template/utils/getOrderHistory.ts) - Order history retrieval
- [`getTreasuryWalletAuthorizationToken.ts`](src/api-template/utils/getTreasuryWalletAuthorizationToken.ts) - Treasury wallet token generation
- [`invokeAuthenticate.ts`](src/api-template/utils/invokeAuthenticate.ts) - Authentication invocation
- [`invokeEstimateUserOp.ts`](src/api-template/utils/invokeEstimateUserOp.ts) - User operation estimation
- [`invokeExecuteUserOp.ts`](src/api-template/utils/invokeExecuteUserOp.ts) - User operation execution
- [`sessionKey.ts`](src/api-template/utils/sessionKey.ts) - Session key management
- [`generateClientSignature.ts`](src/api-template/utils/generateClientSignature.ts) - Client signature generation
- [`generateOktoAuthToken.ts`](src/api-template/utils/generateOktoAuthToken.ts) - Okto authentication token generation
- [`generatePaymasterData.ts`](src/api-template/utils/generatePaymasterData.ts) - Paymaster data generation
- [`generateSignMessagePayload.ts`](src/api-template/utils/generateSignMessagePayload.ts) - Message signing payload generation

#### Explorer (`explorer/`)
Enables blockchain data querying, transaction monitoring, and address information retrieval for comprehensive blockchain interaction.

- [`getAccount.ts`](src/api-template/explorer/getAccount.ts) - Account information retrieval
- [`getChains.ts`](src/api-template/explorer/getChains.ts) - Supported chains information
- [`getPortfolio.ts`](src/api-template/explorer/getPortfolio.ts) - Portfolio balance and assets
- [`getPortfolioActivity.ts`](src/api-template/explorer/getPortfolioActivity.ts) - Portfolio transaction history
- [`getTokens.ts`](src/api-template/explorer/getTokens.ts) - Supported tokens information
- [`readContractData.ts`](src/api-template/explorer/readContractData.ts) - Smart contract data reading

#### Helpers (`helper/`)
Offers common utility functions for data conversion, serialization, and blockchain-specific operations to simplify development.

- [`abi.ts`](src/api-template/helper/abi.ts) - ABI encoding and decoding utilities
- [`constants.ts`](src/api-template/helper/constants.ts) - Common constants and configuration
- [`nonceToBigInt.ts`](src/api-template/helper/nonceToBigInt.ts) - Nonce conversion utilities
- [`serializeJson.ts`](src/api-template/helper/serializeJson.ts) - JSON serialization helpers
- [`types.ts`](src/api-template/helper/types.ts) - TypeScript type definitions

### 3. Trade Service (`src/trade-service/`)
This template focuses on trading-specific functionality:

#### API Integration (`api/`)
- [`getBestRoute.ts`](src/trade-service/api/getBestRoute.ts) - Find optimal trading routes
- [`getCallData.ts`](src/trade-service/api/getCallData.ts) - Generate transaction call data
- [`getQuote.ts`](src/trade-service/api/getQuote.ts) - Fetch real-time trading quotes
- [`registerIntent.ts`](src/trade-service/api/registerIntent.ts) - Register trading intents

#### Utilities (`utils/`)
- [`types.ts`](src/trade-service/utils/types.ts) - Trading-specific type definitions
- [`axiosClient.ts`](src/trade-service/utils/axiosClient.ts) - HTTP client configuration

## Prerequisites and Setup

### Required Tools
- Node.js (v16 or higher)
- npm or yarn
- TypeScript (v4.5 or higher)

### Environment Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

## Common Issues and Troubleshooting

### Authentication Issues
- **Invalid Credentials**: Ensure your API credentials are correctly set in the `.env` file

### Development Tips
- Use the sandbox environment for testing
- Implement proper error handling for all API calls
- Monitor rate limits and implement appropriate backoff strategies
- Use TypeScript for better type safety and development experience

## Support and Resources

- [Okto Documentation](https://docs.okto.tech/)
- [API Reference](https://docs.okto.tech/api-reference)
- [Developer Dashboard](https://dashboard.okto.tech/login)
- [Discord Community](https://discord.com/invite/okto)
- [GitHub Issues](https://github.com/okto-xyz/okto-sdkv2-ts-template/issues)
