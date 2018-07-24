const Migrations = artifacts.require('Migrations.sol');
const config = require('../config');

module.exports = (deployer, network, accounts) => {
    const contractOwner = (network === 'mainnet' || network === 'ropsten') ? config.TOKEN_CONTRACT_OWNER : accounts[0];

    deployer.deploy(Migrations, { from: contractOwner });
};
