// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title TokenVendor
/// @notice Fixed-price token sale. Buyers send ETH and receive SVT at a fixed rate.
///         Every wei of ETH received is forwarded immediately to the multisig treasury,
///         so no single person can drain the proceeds.
contract TokenVendor is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public immutable treasury;
    uint256 public immutable rate; // tokens per 1 ETH (token has 18 decimals)

    event TokensPurchased(address indexed buyer, uint256 ethSpent, uint256 tokensReceived);

    constructor(address _token, address _treasury, uint256 _rate) {
        require(_rate > 0, "Vendor: rate must be > 0");
        token = IERC20(_token);
        treasury = _treasury;
        rate = _rate;
    }

    /// @notice Buy tokens with ETH. Proceeds are forwarded to the treasury in the same call.
    function buyTokens() external payable nonReentrant {
        require(msg.value > 0, "Vendor: send ETH");

        uint256 amount = msg.value * rate;
        require(token.balanceOf(address(this)) >= amount, "Vendor: not enough tokens");

        // Forward all ETH to the multisig treasury before releasing tokens.
        (bool ok, ) = treasury.call{value: msg.value}("");
        require(ok, "Vendor: ETH transfer failed");

        token.safeTransfer(msg.sender, amount);
        emit TokensPurchased(msg.sender, msg.value, amount);
    }
}
