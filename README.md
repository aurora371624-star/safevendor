# SafeVendor — 去信任化代币发售 + 多签金库

一个轻量的去中心化代币发售平台：投资者用 ETH 按固定价格购买代币，**所有 ETH 直接进入一个 2-of-3 多签金库**，任何单个成员都无法私自转走资金，从而在合约层面阻止「卷款跑路（rug pull）」。

这是 CDS528 小组作业项目，部署在 **Sepolia 测试网**，仅用于教学演示，代币无任何价值。

## 架构（3 个合约）

| 合约 | 作用 |
|------|------|
| `SafeVendorToken.sol` | 标准 ERC-20 代币（SVT），部署时铸造 100 万枚给部署者 |
| `TokenVendor.sol` | 固定价售货机：用户付 ETH → 得到 SVT；ETH 立即转发给金库 |
| `MultiSigTreasury.sol` | 2-of-3 多签金库：发起 → 签名 → 凑满阈值才可执行转账 |

### 关键机制

- **资金直入金库**：`buyTokens()` 在发放代币前，先把 `msg.value` 全量转给金库，销售方个人地址从不过手。
- **2-of-3 多签**：`submitTransaction` 发起者自动算 1 票，还需至少 1 名其他 Owner 确认才能执行。
- **防重复执行 / 防重复确认 / 防越权**：`executed` 状态位 + `isConfirmed` 映射 + `onlyOwner` 修饰符。
- **重入防护**：金库遵循 Checks-Effects-Interactions（先标记 `executed` 再外部调用），并叠加 `ReentrancyGuard`。

## 环境要求

- Node.js 18+（本地用 22.22 验证过）
- npm 依赖：`hardhat ^2.26`、`@nomicfoundation/hardhat-toolbox ^6.0`、`@openzeppelin/contracts ^5.1`（完整清单见 `package.json`）
- 一个 Sepolia 测试网 RPC 地址（Infura / Alchemy 免费申请）
- 一个**测试专用**钱包的私钥（不要用有真实资产的钱包）
- 一个 Etherscan API Key（免费注册，用于验证合约）

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 编译（输出 "Compiled 15 Solidity files successfully"）
npx hardhat compile

# 3. 运行测试（输出 "9 passing"，约 0.5 秒）
npx hardhat test

# 4. 本地验证部署脚本
npx hardhat run scripts/deploy.js
```

## 部署到 Sepolia

```bash
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/<你的项目ID>"
export PRIVATE_KEY="<测试钱包私钥>"
export ETHERSCAN_API_KEY="<你的 Etherscan API Key>"

npm run deploy
```

部署脚本会依次部署三个合约，打印地址，并把 100 万 SVT 转入售货机。

## 验证合约（R5 加分项）

```bash
npx hardhat verify --network sepolia <Token地址> 1000000000000000000000000

npx hardhat verify --network sepolia <Treasury地址> \
  "[owner1地址,owner2地址,owner3地址]" 2

npx hardhat verify --network sepolia <Vendor地址> \
  <Token地址> <Treasury地址> 100
```

验证通过后，把 Etherscan 上的验证链接贴进报告 R5。

## 安全（R4）

已用 `slither . --exclude-dependencies` 运行 [Slither](https://github.com/crytic/slither) 静态扫描，结果见 `docs/slither-output.txt`：**无 High / Medium 级漏洞**，仅有 5 条 INFO 级提示（低级别 `call` 为转账必需、`pragma` 版本约束、`solc-version` 版本建议、缺失零地址检查提示），均已在报告中逐条说明。

### 威胁模型

| 威胁 | 场景 | 缓解 | 对应测试 |
|------|------|------|---------|
| 单点作恶（Rug Pull） | 单个成员私自转走全部 ETH | 2-of-3 多签，单人无法执行转账 | `submit auto-confirms, then confirm + execute` |
| 重放攻击 | 同一笔提款重复执行 | `executed` 状态位，执行一次后再次调用即 revert | `rejects re-execution` |
| 重复确认 | 同一 Owner 反复确认凑阈值 | `isConfirmed` 映射，二次确认 revert | `rejects a double confirmation` |
| 重入攻击 | 恶意合约在收款时回调提款 | CEI + `ReentrancyGuard` | — |
| 越权操作 | 非 Owner 发起/确认交易 | `onlyOwner` 修饰符 | `rejects non-owner submit and confirm` |

## 已知局限

- 多签是固定 2-of-3，owner 不能增删、没做时间锁；要上生产这俩都得补。
- 售货机是固定价，不随供需调价，库存卖完就停。
- `submitTransaction` 发起者自动投票，代价是发起者不能「只提案不表态」。

这些不在本作业范围内。

## 合规声明

本项目仅部署在 Sepolia 测试网，使用测试币，代币无经济价值，纯属教学用途。不构成任何形式的募资或证券发行。

## 许可

MIT
