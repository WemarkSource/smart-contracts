# Wemark smart contracts

#### Smart contracts in this repository
* _WemarkToken_ contract is in `contracts/WemarkToken.sol`

## Setup
```
$ npm install
$ npm install -g truffle
```

## Testing
```
$ ./scripts/test.sh
```

## Test coverage
```
$ ./scripts/coverage.sh
```

## Flatten contracts (for using in Remix or verifying on Etherscan)
```
$ ./scripts/flatten_contracts.sh
```
#### Output dir: `contracts/flattened`



## WemarkToken structure
WemarkToken is implemented in `WemarkToken.sol`, complying with ERC20 standard. The token behavior is inherited from a few major token implementations, developed by TokenMarket and OpenZeppelin.

#### BurnableToken (`lib/token/BurnableToken.sol`)
A pretty common functionality that lets any token holder burn tokens. Burning decreases the total token supply.

#### ReleasableToken (`lib/token/ReleasableToken.sol`)
Allows the token owner to control who can transfer tokens. We're using it to allow a smooth roll-out of Wemark Token to contributors. Once the token has been released, we have no option to lock transfers later on.

#### UpgradeableToken (`lib/token/UpgradeableToken.sol`)
Allows us to migrate token functionality to a new contract, at any point in time. This is vital in the case that we would like to fix a critical bug or upgrade the functionality of the token.

#### VestedToken (`lib/token/VestedToken.sol`)
Allows any token holder to grant tokens to any party under a vesting plan (with start, cliff and vesting points). Our main usage for this feature is distributing the company's allocated tokens (to team, advisory, etc.).