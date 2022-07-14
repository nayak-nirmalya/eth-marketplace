const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
  contracts_build_directory: './public/contracts',
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*',
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: '',
          },
          providerOrUrl: 'https://ropsten.infura.io/v3/YOUR-PROJECT-ID',
          addressIndex: 0,
        }),
      network_id: 3,
      gas: 5500000, // Gas Limit
      gasPrice: 20000000000, // for Unit of Gas
      confirmations: 2, // No. of Blocks to Wait
      timeoutBlocks: 200,
    },
  },

  compilers: {
    solc: {
      version: '0.8.4',
    },
  },
}
