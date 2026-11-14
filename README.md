# SafeVendor

**Repository:** https://github.com/aurora371624-star/safevendor

SafeVendor is a fixed-price ERC-20 sale that sends every sale payment directly
to a 2-of-3 multisig treasury. A single treasury owner cannot move user funds.

This repository is the CDS528 group project submission. It targets Ethereum
Sepolia and uses worthless test assets only.

## Live Sepolia deployment

Network: [Sepolia](https://sepolia.etherscan.io) (`chainId: 11155111`)

| Contract | Address | Verification |
|---|---|---|
| SafeVendorToken | [`0xb2caA86b7b758800C09923716213719C456FD46E`](https://sepolia.etherscan.io/address/0xb2caA86b7b758800C09923716213719C456FD46E#code) | Verified |
| MultiSigTreasury | [`0x427038b1e08c3C582C6096233285bd7b26fab4c9`](https://sepolia.etherscan.io/address/0x427038b1e08c3C582C6096233285bd7b26fab4c9#code) | Verified |
| TokenVendor | [`0x1BE452F65B35E3aa8ecD41BbCD7d7C9324705270`](https://sepolia.etherscan.io/address/0x1BE452F65B35E3aa8ecD41BbCD7d7C9324705270#code) | Verified |

Deployment evidence is stored in
[`deployments/sepolia.json`](deployments/sepolia.json).

The treasury uses these fixed owners and a threshold of two:

| Owner | Address |
|---|---|
| Owner 1 | `0x758090f1c15a76fFf31C5852e71f68ABCF24FA61` |
| Owner 2 | `0xbaA884A7B6cAe7d8CEC920a5Ce92e47B6B231031` |
| Owner 3 | `0x8fcFd31be53b4b2F8C9394d49f92dE56Da2b75c2` |

### Live transaction evidence

| Action | Transaction |
|---|---|
| Deploy SVT | [`0x473a9b74...b53dc`](https://sepolia.etherscan.io/tx/0x473a9b7441b61b8da19af84b16d6bd1ac5aed13f08716d331ddb56796b2b53dc) |
| Deploy Treasury | [`0xa0e81226...0774`](https://sepolia.etherscan.io/tx/0xa0e81226b1b899582a568f9b77f5995a24d6d41213df54405b6574c9c8470774) |
| Deploy Vendor | [`0x1d02dd7b...0818`](https://sepolia.etherscan.io/tx/0x1d02dd7bb4c18c7f5afb08e50533729e77f8c67f897905e30e1ed24c72620818) |
| Fund 1,000,000 SVT inventory | [`0xe786a295...341b`](https://sepolia.etherscan.io/tx/0xe786a2957e974547da69db357a322f9e212286f3a782517f9f0df5250090341b) |

The current deployment configures the deployer as Owner 1. Owner 2 and Owner 3
are independent treasury addresses. The vendor holds the full 1,000,000 SVT
inventory.

## Architecture

```mermaid
flowchart LR
    B[Buyer] -->|ETH| V[TokenVendor]
    V -->|Checked native transfer| T[2-of-3 MultiSigTreasury]
    V -->|SVT| B
    O1[Owner 1] -->|submit + confirm| T
    O2[Owner 2] -->|confirm| T
    O3[Owner 3] -->|backup confirmation| T
    T -->|execute after threshold| R[Recipient]
```

### Contracts

| Contract | Responsibility | Key control |
|---|---|---|
| `SafeVendorToken` | Fixed-supply ERC-20 named SVT | No post-deployment mint authority |
| `TokenVendor` | Fixed-rate sale and direct ETH settlement | Immutable price and treasury |
| `MultiSigTreasury` | Shared custody and proposals | Fixed owners, 2-of-3 threshold |

### Sale mechanics

- Sale price: `0.0001 ETH` per `1 SVT`.
- Supply: `1,000,000 SVT`, minted once at deployment.
- Inventory: all SVT is transferred to the vendor after deployment.
- ETH settlement: the vendor sends sale proceeds to Treasury in the same
  transaction.
- Rounding: the buyer specifies `minTokensOut`; any integer remainder is
  refunded.
- Failure behavior: a failed treasury payment, refund, or token transfer reverts
  the complete purchase.

### Treasury mechanics

1. An owner submits a transaction. The submission counts as that owner's first
   confirmation.
2. A different owner confirms it.
3. Once two confirmations exist, an owner executes the transaction.
4. Execution marks the transaction before making the external call, using
   Checks-Effects-Interactions and `ReentrancyGuard`.

## Project structure

```text
contracts/           Solidity source and the reentrancy test receiver
scripts/             deployment, verification, wallet setup, and live demo scripts
test/                Hardhat unit and failure-path tests
frontend/            Vite + ethers.js operational dApp
deployments/         generated Sepolia address and transaction evidence
docs/                architecture, security, requirements, and demo material
report/              final report source and exported files
slides/              final presentation and rendering checks
outputs/             submission-ready copies for the user
```

## Setup

Requirements:

- Node.js 20 or newer
- `pnpm` through Corepack, or a compatible Node package manager
- A Sepolia RPC endpoint
- A test-only deployment wallet
- An Etherscan API key for command-line verification

```bash
corepack enable
pnpm install
pnpm compile
pnpm test
pnpm coverage
pnpm lint:sol
pnpm frontend:build
```

The current verification run produced:

- 17 passing tests
- 100% statement, function, and line coverage for production contracts
- 79.03% aggregate branch coverage
- Slither: no High or Medium findings; two intentional low-level `call` INFO
  findings

## Environment configuration

Copy `.env.example` to `.env` and set the values. Never commit `.env`.

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<project-id>
PRIVATE_KEY=<test-only deployer key>
TREASURY_OWNERS=<owner1>,<owner2>,<owner3>
ETHERSCAN_API_KEY=<key>
```

`PRIVATE_KEY` must belong to a dedicated test wallet. The repository ignores
`.env`, wallet candidate files, and private key material.

## Deploy

```bash
pnpm deploy
```

The script performs these steps:

1. Validates the Sepolia chain ID.
2. Deploys `SafeVendorToken` with 1,000,000 SVT.
3. Deploys `MultiSigTreasury` with three distinct owners and threshold `2`.
4. Deploys `TokenVendor` with the token, treasury, and fixed price.
5. Transfers the complete token supply to the vendor.
6. Writes addresses, constructor arguments, and transaction hashes to
   `deployments/sepolia.json` and `frontend/src/deployment.json`.

Deployment order matters because Treasury has no setters and Vendor immutably
stores the Token and Treasury addresses.

## Verify

The live contracts are already verified using Etherscan's Standard JSON input.
To verify a fresh deployment from the command line:

```bash
pnpm verify
```

`pnpm verify` requires `ETHERSCAN_API_KEY`. The verification source is generated
from the Hardhat build info with Solidity `0.8.24`, optimizer enabled, and 200
runs.

## Frontend

```bash
pnpm frontend:dev
```

The dApp can:

- Read live vendor inventory and treasury balance.
- Quote a fixed-price purchase.
- Connect a Sepolia wallet and buy with slippage protection.
- Show treasury owners, threshold, and recent proposals.
- Submit, confirm, and execute treasury transfers from owner wallets.

Production build:

```bash
pnpm frontend:build
```

## Security summary

| Threat | Mitigation |
|---|---|
| Single-owner rug pull | Sale proceeds enter a 2-of-3 Treasury; Vendor has no seller withdrawal path |
| Reentrancy | CEI, `executed` state, and `ReentrancyGuard` |
| Duplicate confirmation | Per-transaction `isConfirmed` mapping |
| Unauthorized treasury action | `onlyOwner` checks for submit, confirm, and execute |
| Replay | `executed` is set before the external call |
| Wrong payment or inventory | Slippage check, inventory check, checked ETH sends, and atomic revert |
| Upgrade/admin abuse | No proxy, no pause, no owner setter, and fixed supply |

Read [`docs/SECURITY.md`](docs/SECURITY.md) for threat assumptions and scan
details.

## Operations stance

SafeVendor intentionally has no pause or upgrade mechanism. This reduces
administrative risk and keeps the token, price, owner set, and threshold
immutable. The trade-off is that a discovered logic defect cannot be patched in
place; a new deployment is required. The project is designed for Sepolia only.

## Requirements mapping

The rubric-by-rubric evidence map is in
[`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md). It covers R1 through R7,
deliverables D1-D3, academic integrity, and submission logistics.

## External code and references

SafeVendor uses OpenZeppelin Contracts 5.4.0 under the MIT License for ERC-20,
SafeERC20, Math, and ReentrancyGuard. Hardhat, ethers.js, Vite, Lucide, Slither,
Solidity, and Etherscan are cited in the report and in
[`docs/REFERENCES.md`](docs/REFERENCES.md).

## AI-assisted work disclosure

The project used AI assistance for implementation drafts, test ideation,
documentation structure, and presentation drafting. The group reviewed the
generated content for correctness, runtime behavior, citation accuracy, and
license compatibility before submission. AI output is not treated as an
authority or as evidence of correctness.

## Group and presenter map

| Member | Role | Presentation segment |
|---|---|---|
| Yang Qingchen | Group Lead | Slides 1-2 |
| Xu Fang | Smart Contract Lead | Slides 3-4 |
| Wang Zijian | Testing and Security Analyst | Slides 5-6 |
| Wu Fei | Deployment and DevOps Engineer | Slides 7-8 |
| Chen Qikai | Frontend and Documentation Engineer | Slides 9-10 |

## License

Project code is released under the [MIT License](LICENSE). Dependencies retain
their own licenses.

## Disclaimer

This project is deployed on Sepolia with test-only assets. SVT has no economic
value and the project is not an offer of securities or a request for real funds.
