# Smart Contract - Stacks Multisig Vaults

This directory contains the Clarity smart contract implementation for the Stacks Multisig Vaults project.

## Project Structure

```
smart-contract/
├── contracts/          # Clarity smart contract files (.clar)
│   └── multisig.clar  # Main multisig contract
├── tests/              # Test files (.test.ts)
│   └── multisig.test.ts
├── settings/           # Configuration files for different networks
│   ├── Devnet.toml    # Development network settings
│   └── Testnet.toml   # Testnet deployment settings
├── deployments/        # Deployment plans
│   └── (generated deployment files)
├── Clarinet.toml       # Clarinet configuration
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Overview

The multisig vault contract enables secure multi-signature wallet functionality on Stacks. It supports:

- **Multiple Signers**: Up to 100 signers can be configured
- **Flexible Thresholds**: Configurable signature requirements (e.g., 2/3, 4/5, 8/10)
- **STX Transfers**: Native Stacks token transfers
- **SIP-010 Token Support**: Support for fungible tokens like sBTC
- **Off-chain Signing**: Signatures are collected off-chain and verified on-chain

## Key Features

1. **Initialization**: One-time setup by contract owner to configure signers and threshold
2. **Transaction Submission**: Any signer can submit a transaction proposal
3. **Off-chain Signing**: Signers sign transaction hashes off-chain
4. **On-chain Execution**: Transactions execute only after threshold signatures are verified
5. **Transaction Types**: Supports both STX and SIP-010 token transfers

## Contract Functions

### Public Functions

- `initialize` - Initialize the multisig with signers and threshold (owner only, one-time)
- `submit-txn` - Submit a new transaction proposal (signers only)
- `execute-stx-transfer-txn` - Execute a pending STX transfer transaction
- `execute-token-transfer-txn` - Execute a pending SIP-010 token transfer transaction

### Read-Only Functions

- `hash-txn` - Get the hash of a transaction for signing
- `extract-signer` - Extract and verify a signer from a signature

### Private Functions

- `count-valid-unique-signature` - Helper to count valid unique signatures

## Development Setup

Refer to the main project `set.md` file for detailed setup instructions.

Quick start:
1. Install Clarinet
2. Install Node.js dependencies: `npm install`
3. Run tests: `npm run test`

## Testing

Tests are written using Vitest and the Clarinet SDK. Run tests with:

```bash
npm run test
```

## Deployment

To deploy to testnet:

```bash
clarinet deployments generate --testnet --low-cost
clarinet deployment apply -p deployments/default.testnet-plan.yaml
```

## Dependencies

- SIP-010 Trait: `SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard`

## Security Considerations

- Contract can only be initialized once by the owner
- Only configured signers can submit transactions
- Transactions require minimum threshold of valid signatures
- Signatures are verified on-chain to prevent replay attacks
- Each signer can only sign a transaction once

## Resources

- [Clarity Language Documentation](https://docs.stacks.co/docs/clarity)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [SIP-010 Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
