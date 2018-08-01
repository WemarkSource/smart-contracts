const config = require('./config');
const ProviderEngine = require('web3-provider-engine');
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const subproviders = require('@0xproject/subproviders');
const LedgerSubprovider = subproviders.LedgerSubprovider;
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default;
const Eth = require('@ledgerhq/hw-app-eth').default;

async function ledgerEthereumNodeJsClientFactoryAsync() {
    const ledgerConnection = await TransportNodeHid.create();
    const ledgerEthClient = new Eth(ledgerConnection);
    return ledgerEthClient;
}

const engine = new ProviderEngine();
const ledgerSubprovider = new LedgerSubprovider({
    networkId: 1,
    baseDerivationPath: "m/44'/60'/0'",
    ledgerEthereumClientFactoryAsync: ledgerEthereumNodeJsClientFactoryAsync,
    accountFetchingConfigs: {
        addressSearchLimit: 100,
        shouldAskForOnDeviceConfirmation: false
    }
});

engine.addProvider(new FilterSubprovider());
engine.addProvider(ledgerSubprovider);
engine.addProvider(new RpcSubprovider({
    rpcUrl: config.INFURA_MAINNET_URL,
}));

engine.start();

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
        ganache: {
            network_id: 5777,
            host: 'localhost',
            port: 7545,
            gas: 6721975
        },
        ropsten: {
            host: config.INFURA_ROPSTEN_URL,
            network_id: 3,
            port: 8545,
            gas: 3955555,
            gasPrice: 120000000000 // 120 Gwei
        },
        mainnet: {
            provider: engine,
            network_id: 1,
            gas: 4712388,
            gasPrice: 2000000000 // 2 Gwei
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};