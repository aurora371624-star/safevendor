# SafeVendor Submission

Course: CDS528 Blockchain - DeFi Smart Contract Development

Group: SafeVendor Group

Group ID: chocolate

Network: Ethereum Sepolia (`chainId: 11155111`)

## Required links

- **Repository:** https://github.com/aurora371624-star/safevendor
- **Demo video:** https://drive.google.com/file/d/19GgqYu6rX3RfzK1NjU8hw7JJyKef4S2P/view?usp=sharing

The repository and Google Drive video are public. The team demo is 3 minutes and
54 seconds long and
shows the live dApp, purchase mechanics, treasury operations, verified contract
source, purchase transaction evidence, tests, and security results.

## Deliverable map

| Deliverable | Prepared output | Status |
|---|---|---|
| D1 Project report | Existing report supplied separately by the group | Do not regenerate |
| D2 Public source repository | GitHub repository linked above | Complete |
| D3 Demo video | Google Drive link above | Provided; 3 minutes 54 seconds, slightly shorter than the approximate 5-minute target |
| D4 Presentation slides | Existing presentation supplied separately by the group | Do not regenerate |

## Live deployment

| Contract | Sepolia address |
|---|---|
| SafeVendorToken | `0xb2caA86b7b758800C09923716213719C456FD46E` |
| MultiSigTreasury | `0x427038b1e08c3C582C6096233285bd7b26fab4c9` |
| TokenVendor | `0x1BE452F65B35E3aa8ecD41BbCD7d7C9324705270` |

All three address links resolve to verified contracts on Sepolia Etherscan.

## Treasury configuration

| Owner | Address |
|---|---|
| Owner 1 | `0x758090f1c15a76fFf31C5852e71f68ABCF24FA61` |
| Owner 2 | `0xbaA884A7B6cAe7d8CEC920a5Ce92e47B6B231031` |
| Owner 3 | `0x8fcFd31be53b4b2F8C9394d49f92dE56Da2b75c2` |

Threshold: 2 of 3.

## Current recorded state

- 17 Hardhat tests passing.
- 97.73% production-contract statement coverage.
- 100% function and line coverage for the production contracts.
- 79.03% aggregate branch coverage.
- Slither reports no High or Medium findings.
- The treasury balance is 0.019 ETH.
- The vendor holds 999,600 SVT after four recorded demo purchases.
- Three treasury proposals have executed.

## Reproduce

```bash
corepack enable
pnpm install
pnpm compile
pnpm test
pnpm coverage
pnpm lint:sol
pnpm frontend:build
pnpm frontend:dev
```

Environment variables and deployment steps are documented in `README.md`.
Deployment hashes are stored in `deployments/sepolia.json`.

## Moodle handoff

Submit the report and presentation as separate Moodle deliverables. Use these
URLs in both submission forms and at the top of the final report:

```text
Repository: https://github.com/aurora371624-star/safevendor
Demo video: https://drive.google.com/file/d/19GgqYu6rX3RfzK1NjU8hw7JJyKef4S2P/view?usp=sharing
```

The source archive in this local package excludes the report, slides, installed
dependencies, build outputs, and Git history because those items are either
already supplied separately or reproducible from `pnpm-lock.yaml`.
