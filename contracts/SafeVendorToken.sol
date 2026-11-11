// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title SafeVendorToken
/// @notice Plain ERC-20 sold by the token vendor. The full initial supply is minted
///         to the deployer, who transfers the sale stock into the TokenVendor.
contract SafeVendorToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("SafeVendor Token", "SVT") {
        _mint(msg.sender, initialSupply);
    }
}
