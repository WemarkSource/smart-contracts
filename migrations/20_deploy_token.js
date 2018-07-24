const WemarkToken = artifacts.require("WemarkToken.sol");
const config = require('../config');

module.exports = (deployer, network, accounts) => {
    const tokenContractOwner = (network === 'mainnet' || network === 'ropsten') ? config.TOKEN_CONTRACT_OWNER : accounts[0];

    console.log('\n\nDeploying WemarkToken...\n\n');

    try {
        return deployer.deploy(WemarkToken, { from: tokenContractOwner });
    } catch (error) {
        console.error('\n\nError while deploying WemarkToken\n\n', error);
    }
};
