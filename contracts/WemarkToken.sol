pragma solidity ^0.4.18;

import './lib/token/CrowdsaleToken.sol';
import './lib/token/BurnableToken.sol';
import './lib/token/VestedToken.sol';

/**
 * WemarkToken smart contract, representing the digital currency to be used by the Wemark protocol.
 * Written under ERC20 standard (https://github.com/ethereum/EIPs/issues/20).
 *
 * This smart contract makes use of TokenMarket and OpenZeppelin reusable smart contracts.
 * These parties has nothing to do with any of the logic implemented here.
 * For further information, please contact support[at]wemark.com
 */
contract WemarkToken is CrowdsaleToken, BurnableToken, VestedToken {

    modifier validDestination(address to) {
        require(to != address(0x0));
        require(to != address(this));
        _;
    }


    function WemarkToken() CrowdsaleToken('WemarkToken', 'WMK', 135000000 * (10 ** 18), 18) public {
        /** Initially allow only token creator to transfer tokens */
        setTransferAgent(msg.sender, true);
    }

    /**
     * @dev Checks modifier and allows transfer if tokens are not locked or not released.
     * @param _to The address that will receive the tokens.
     * @param _value The amount of tokens to be transferred.
     */
    function transfer(address _to, uint _value)
        validDestination(_to)
        canTransferReleasable(msg.sender)
        canTransferLimitedTransferToken(msg.sender, _value) public returns (bool) {
        // Call BasicToken.transfer()
        return super.transfer(_to, _value);
    }

    /**
     * @dev Checks modifier and allows transfer if tokens are not locked or not released.
     * @param _from The address that will send the tokens.
     * @param _to The address that will receive the tokens.
     * @param _value The amount of tokens to be transferred.
     */
    function transferFrom(address _from, address _to, uint _value)
        validDestination(_to)
        canTransferReleasable(_from)
        canTransferLimitedTransferToken(_from, _value) public returns (bool) {
        // Call StandardToken.transferForm()
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Prevent accounts that are blocked for transferring their tokens, from calling approve()
     */
    function approve(address _spender, uint256 _value) public returns (bool) {
        // Call StandardToken.transferForm()
        return super.approve(_spender, _value);
    }

    /**
     * @dev Prevent accounts that are blocked for transferring their tokens, from calling increaseApproval()
     */
    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        // Call StandardToken.transferForm()
        return super.increaseApproval(_spender, _addedValue);
    }

    /**
     * @dev Can upgrade token contract only if token is released and super class allows too.
     */
    function canUpgrade() public constant returns(bool) {
        return released && super.canUpgrade();
    }

    /**
     * @dev Calculate the total amount of transferable tokens of a holder for the current moment of calling.
     * @param holder address The address of the holder
     * @return An uint256 representing a holder's total amount of transferable tokens.
     */
    function transferableTokensNow(address holder) public constant returns (uint) {
        return transferableTokens(holder, uint64(now));
    }

    function () payable {
        // If ether is sent to this address, send it back
        revert();
    }
}
