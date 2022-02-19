pragma solidity >=0.4.22 <0.6.0;
import './ProjectFactory.sol';

contract ProjectFactoryMock is ProjectFactory {
  constructor (
    ProjectFactoryHelper _projectFactoryHelper,
    GNITokenCrowdsale _crowdsale,
    address _developer,
    address _dividendWallet
    ) public
    ProjectFactory(
      _projectFactoryHelper,
      _crowdsale,
      _developer,
      _dividendWallet
      ){}
}
