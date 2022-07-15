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

## Scripts

### Compile
`yarn compile`

### Generate typings
`yarn typegen`

### Run tests
`yarn test`

### Lint
`yarn lint`

### Deploy
`yarn deploy --network <supported network>`

### Export ABI
`yarn abi`

## Proxy
We are using UUPS proxy pattern.

Requires:

openzeppelin/hardhat-upgrades

To deploy proxy:
`upgrades.deployProxy(ContractFactory, [contructor args], { kind : "uups" })`

To update proxy:
`upgrades.upgradeProxy(address of old impl, newContractFactory)`

Through command line:



Simple rules to upgrade contract:

1. Don't forget to implement upgrade method inside implementation(_authorizeUpgrade).
2. Append new variables to the end of varaible list.
3. Don't delete old variables.


