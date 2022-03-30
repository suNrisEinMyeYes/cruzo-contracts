# Cruzo Contracts

## Tokens 
- Cruzo1155

## Networks
### Binance
- bscTestnet
- bscMainnet
### Polygon
- polygonMumbai
- polygonMainnet
### Cronos
- cronosMainnetBeta
- cronosTestnet
### Avalanche
- avaxMainnet
- avaxFuji

## Compile
`yarn compile`

## Deploy
`yarn deploy --network <supported network>`

### Legacy scripts:

    "deploy-contract-cronos-mainnet": "npx hardhat run scripts/deploy.ts --network cronosMainnetBeta",
    "deploy-contract-cronos-testnet": "npx hardhat run scripts/deploy.ts --network cronosTestnet",
    "deploy-contract-avax-mainnet": "npx hardhat run scripts/deploy.ts --network avaxMainnet",
    "deploy-contract-avax-testnet": "npx hardhat run scripts/deploy.ts --network avaxFuji"