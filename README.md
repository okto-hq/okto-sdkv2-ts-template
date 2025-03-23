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

This template also provides detailed examples for direct API integration with Okto. These examples are located in the following files:

- [`src/oktoAuthenticate_template.ts`](src/oktoAuthenticate_template.ts) - Authentication and token generation
- [`src/tokenTransferIntent_template.ts`](src/tokenTransferIntent_template.ts) - Token transfer implementation
- [`src/nftTransferIntent_template.ts`](src/nftTransferIntent_template.ts) - NFT transfer implementation
- [`src/rawTransactionIntent_template.ts`](src/rawTransactionIntent_template.ts) - Raw transaction implementation
- [`src/delegatedActions_template.ts`](src/delegatedActions_template.ts) - Delegated actions implementation

Each file contains detailed comments explaining the implementation steps.

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