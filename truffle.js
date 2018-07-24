const Web3 = require('web3');
const config = require('./config');

module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*',
            gasPrice: 120000000000,
            gas: 4700036
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
            gas: 0xfffffffffff, // <-- Use this high gas value
            gasPrice: 0x01      // <-- Use this low gas price
        },
        ropstenInfura: {
            provider: new Web3.providers.HttpProvider(config.INFURA_ROPSTEN_URL),
            network_id: 3,
            gas: 3955555
        },
        ropsten: {
            host: config.ROPSTEN_NODE_URL,
            network_id: 3,
            port: 8545,
            gas: 3955555,
            gasPrice: 120000000000 // 120 Gwei
        },
        ganache: {
            network_id: 5777,
            host: 'localhost',
            port: 7545,
            gas: 6721975
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};