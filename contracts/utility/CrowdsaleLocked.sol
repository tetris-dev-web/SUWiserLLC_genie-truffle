pragma solidity >=0.4.22 <0.6.0;

/**
 * @title CrowdsaleLocked
 * @dev A CrowdsaleLocked contract can only be used by its crowdsale account (the one that created it)
 */
contract CrowdsaleLocked {
    address private _crowdsale;

    event CrowdsaleTransferred(
        address recipient
    );

    /**
     * @dev Sets the crowdsale account to the one that is creating the CrowdsaleLocked contract.
     */
    constructor () internal {
        _crowdsale = msg.sender;
        emit CrowdsaleTransferred(_crowdsale);
    }

    /**
     * @dev Reverts if called from any account other than the crowdsale.
     */
    modifier onlyCrowdsale() {
        require(msg.sender == _crowdsale);
        _;
    }

    /**
     * @return the address of the crowdsale.
     */
    function crowdsale() public view returns (address) {
        return _crowdsale;
    }

    /**
     * @dev Transfers contract to a new crowdsale.
     * @param recipient The address of new crowdsale.
     */
    function transferCrowdsaleKey(address recipient) public onlyCrowdsale {
        require(recipient != address(0));
        _crowdsale = recipient;
        emit CrowdsaleTransferred(_crowdsale);
    }
}
