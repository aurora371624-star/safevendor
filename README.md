# SafeVendor — 代币发售 + 2-of-3 多签金库

CDS528 小组项目。一句话：用户花 ETH 买我们发的代币，卖币收进来的 ETH 不落任何个人钱包，而是直接进一个 2-of-3 多签金库，凑不齐两个人的签名谁也动不了。这是对「项目方卷款跑路（rug pull）」这个老问题的一个最小实现。

部署在 Sepolia 测试网，代币没有价值，纯教学演示。

## 合约结构

就三个合约：

| 合约 | 干什么 |
|------|--------|
| `contracts/SafeVendorToken.sol` | ERC-20 代币 SVT，部署时铸 100 万枚给部署者 |
| `contracts/TokenVendor.sol` | 售货机：收 ETH 发 SVT，ETH 立刻转进金库 |
| `contracts/MultiSigTreasury.sol` | 2-of-3 多签金库：提款要两个人签名才放行 |

资金流：`买家 --ETH--> TokenVendor --ETH--> MultiSigTreasury --(2/3 签名)--> 提款地址`。

## 几个设计决定

- **ETH 不过手**：`buyTokens()` 在发代币之前，先把 `msg.value` 全量转给金库。售货机本身不留 ETH，项目方个人地址从头到尾碰不到钱。
- **submit 即投一票**：`submitTransaction()` 的发起者自动算 1 票，所以演示流程是「发起 = 1/2，再签一人 = 2/2」。
- **三道路栏**：`executed` 状态位挡住重复执行、`isConfirmed` 映射挡住同一个人重复确认、`onlyOwner` 挡住非 owner 操作。
- **先改状态再转账**：`executeTransaction()` 先标记 `executed = true` 再做外部调用（Checks-Effects-Interactions），再叠一层 OpenZeppelin 的 `ReentrancyGuard`。

## 环境要求

- Node.js 18+（本地用 22 跑的）
- npm 依赖：Hardhat 2.26 + OpenZeppelin Contracts 5.1（`@nomicfoundation/hardhat-toolbox`）
- 一个 Sepolia RPC 地址（Infura / Alchemy 免费）
- 一个**只用于测试**的钱包私钥（别用有真钱的）
- 一个 Etherscan API key（验证合约用）

## 跑起来

```bash
npm install
npx hardhat compile      # 输出 "Compiled 15 Solidity files successfully"
npx hardhat test         # 9 个用例，约 0.5 秒全绿
npx hardhat run scripts/deploy.js   # 本地网络试跑部署脚本
```

## 部署到 Sepolia

```bash
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/<你的项目ID>"
export PRIVATE_KEY="<测试钱包私钥>"
export ETHERSCAN_API_KEY="<你的 Etherscan API Key>"

npm run deploy
```

脚本会依次部署三个合约、打印地址，并把 100 万 SVT 打进售货机。

## 验证合约（Etherscan）

```bash
npx hardhat verify --network sepolia <Token地址> 1000000000000000000000000
npx hardhat verify --network sepolia <Treasury地址> "[owner1,owner2,owner3]" 2
npx hardhat verify --network sepolia <Vendor地址> <Token地址> <Treasury地址> 100
```

验证完把 Etherscan 链接贴进报告 R5。

## 安全

跑过 [Slither](https://github.com/crytic/slither) 静态分析（`slither . --exclude-dependencies`），结果在 `docs/slither-output.txt`：没有 High / Medium 级发现。剩下 5 条都是 INFO 级提示——`low-level-calls`（两处转账 `call` 都做了返回值检查）、`pragma` / `solc-version`（版本约束提示）、`missing-zero-check`（构造函数可再加零地址校验），逐条在报告里解释了。

### 威胁模型

| 威胁 | 攻击长什么样 | 我们怎么挡 | 对应测试 |
|------|-------------|-----------|---------|
| Rug pull | 单人想转走全部 ETH | 2-of-3 多签，一个签名凑不满 | `submit auto-confirms, then confirm + execute` |
| 重放 | 同一笔提款执行两次 | `executed` 状态位，第二次调用 revert | `rejects re-execution` |
| 重复确认 | 同一个人反复确认刷票 | `isConfirmed` 映射 | `rejects a double confirmation` |
| 重入 | 收款合约回调提款 | CEI + `ReentrancyGuard` | — |
| 越权 | 非 owner 发起/确认 | `onlyOwner` | `rejects non-owner submit and confirm` |

## 已知局限

- 多签是固定 2-of-3，owner 不能增删、没做时间锁；要上生产这俩都得补。
- 售货机是固定价，不随供需调价，库存卖完就停。
- `submitTransaction` 发起者自动投票是省一步操作的取舍，代价是发起者不能「只提案不表态」。

这些都不在这份作业范围内。

## 合规

只在 Sepolia 测试网部署，测试币、无价值、纯教学，不构成募资或证券发行。

## 许可

MIT
