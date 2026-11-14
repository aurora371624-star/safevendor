# SafeVendor Submission

## Final files

- `SafeVendor_Project_Report.docx`
- `SafeVendor_Project_Report.pdf`
- `SafeVendor_Presentation.pptx`
- `SafeVendor_Source.zip`

This package contains the final SafeVendor project version deployed from the
project owner's MetaMask account on Ethereum Sepolia.

## Repository

https://github.com/aurora371624-star/safevendor

Group: SafeVendor Group  
Group ID: SafeVendor

## Verified contracts

| Contract | Sepolia address |
|---|---|
| SafeVendorToken | `0xb2caA86b7b758800C09923716213719C456FD46E` |
| MultiSigTreasury | `0x427038b1e08c3C582C6096233285bd7b26fab4c9` |
| TokenVendor | `0x1BE452F65B35E3aa8ecD41BbCD7d7C9324705270` |

All three contracts have Etherscan-verified source and ABI. The Treasury uses
Etherscan's similar-bytecode source match.

## Treasury configuration

| Owner | Address |
|---|---|
| Owner 1 | `0x758090f1c15a76fFf31C5852e71f68ABCF24FA61` |
| Owner 2 | `0xbaA884A7B6cAe7d8CEC920a5Ce92e47B6B231031` |
| Owner 3 | `0x8fcFd31be53b4b2F8C9394d49f92dE56Da2b75c2` |

Threshold: 2 of 3.

## Recorded verification

- 17 Hardhat tests passing.
- 100% production statement, function, and line coverage.
- Aggregate branch coverage: 79.03%.
- Slither: no High or Medium findings.
- Vendor inventory: 1,000,000 SVT.

## Group and presenter map

- Group Lead: Yang Qingchen (slides 1-2)
- Smart Contract Lead: Xu Fang (slides 3-4)
- Testing and Security Analyst: Wang Zijian (slides 5-6)
- Deployment and DevOps Engineer: Wu Fei (slides 7-8)
- Frontend and Documentation Engineer: Chen Qikai (slides 9-10)

The public repository gives the instructor and TA read access. Submit the report
and presentation as separate Moodle deliverables.

Owner 3 does not need Sepolia ETH to remain an owner, but needs test ETH to
confirm or execute a treasury transaction.
