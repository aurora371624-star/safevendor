# Five-Minute Demonstration Script

The team's recorded walkthrough is available at:

https://drive.google.com/file/d/19GgqYu6rX3RfzK1NjU8hw7JJyKef4S2P/view?usp=sharing

## Preparation

1. Open the dApp with `pnpm frontend:dev`.
2. Confirm that the dashboard loads Treasury balance `0.019 ETH`, vendor
   inventory `999,600 SVT`, and threshold `2 of 3`.
3. Keep the TokenVendor Etherscan page open as a fallback for network problems.
4. Keep the purchase transaction page open as independent settlement evidence.

## Recorded sequence

1. Introduce the custody window and the project goal.
2. Explain why the vendor has no withdrawal path and why sale proceeds go
   directly to the treasury.
3. Show the three-stage architecture: buyer, vendor, treasury.
4. Open the live dashboard and identify the Sepolia network, Treasury balance,
   remaining inventory, and approval threshold.
5. Enter `0.01 ETH` in the purchase panel and show the `100 SVT` quote.
6. Point out `minTokensOut` and the same-transaction settlement note.
7. Show the treasury proposal flow and the executed proposal history.
8. Show the three contract addresses in the deployment registry.
9. Open the verified TokenVendor contract on Etherscan.
10. Show Solidity `0.8.24`, the MIT license, and the optimizer setting.
11. Show the successful purchase transaction, the ETH transfer to the
    treasury, and the 100 SVT delivery to the buyer.
12. Show the test and security metrics.
13. Show the repository setup commands and conclude with the design limits.

## Q&A preparation

### Why not let the seller receive ETH and forward it?

That creates a single point of failure and a custody window. SafeVendor
forwards ETH to Treasury in the purchase transaction.

### Why 2-of-3?

It tolerates one unavailable owner while preventing one compromised owner from
moving funds. The trade-off is that two unavailable owners halt execution.

### Why immutable?

Immutability removes upgrade, pause, owner replacement, and threshold-change
backdoors. The cost is that a logic defect requires redeployment.

### Why use a low-level call?

Treasury owners may need to call contract wallets or contracts with calldata.
The success flag is checked and execution is protected against reentrancy.

### What happens if the price does not divide evenly?

The vendor calculates a whole token-unit amount and refunds the remainder. If
the refund fails, the purchase reverts.

### Where is the novelty?

The design combines a token vendor with direct multisig settlement. The sale
contract cannot accumulate proceeds, and the treasury cannot be administered by
one privileged account.

### What are the main limitations?

- Sepolia-only demonstration.
- No dynamic owner management.
- No upgrade or pause path.
- No oracle; the fixed price does not track market value.
- The dApp is operational evidence, not a production wallet interface.
