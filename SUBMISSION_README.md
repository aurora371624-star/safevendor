# SafeVendor Submission

## Final files

- `report/SafeVendor_Project_Report.docx`
- `report/SafeVendor_Project_Report.pdf`
- `slides/SafeVendor_Presentation.pptx`
- `SafeVendor_Source.zip`

This package contains the final SafeVendor project version deployed from the
project owner's MetaMask account on Ethereum Sepolia.

## Repository

https://github.com/aurora371624-star/safevendor

## Verified contracts

| Contract | Sepolia address |
|---|---|
| SafeVendorToken | `0x08271e00B298A44476f0b1e71d7A8Dfade182BCb` |
| MultiSigTreasury | `0xD3F60906B1A52A9dd18ec9e8d212D38f3361Bd99` |
| TokenVendor | `0xE8499D41C7300D95832359b67e9af261d5D11DC6` |

All three contracts have Etherscan source verification with an Exact Match.

## Treasury configuration

| Owner | Address |
|---|---|
| Owner 1 | `0x758090f1c15a76fFf31C5852e71f68ABCF24FA61` |
| Owner 2 | `0xAD8C645384858B50b988BFEbb0c1DB6f996C5A76` |
| Owner 3 | `0x8fcFd31be53b4b2F8C9394d49f92dE56Da2b75c2` |

Threshold: 2 of 3.

## Recorded verification

- 17 Hardhat tests passing.
- 100% production statement, function, and line coverage.
- Aggregate branch coverage: 79.03%.
- Slither: no High or Medium findings.
- Vendor inventory: 1,000,000 SVT.

## Before Moodle submission

- Insert the formal group ID in the report and slide cover.
- Confirm the five presenter assignments.
- Give the instructor and TA read access to the repository.

Owner 3 does not need Sepolia ETH to remain an owner, but needs test ETH to
confirm or execute a treasury transaction.
