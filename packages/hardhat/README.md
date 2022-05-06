# Setup

Create a .env taking .env.example as reference

Setup ROPSTEN_URL and ACCOUNT_KEY if deploying to anything other than localhost

# Setup localhost

Add Localhost Network to Metamask if missing:

- name: localhost
- rpc url: http://localhost:8545
- chain id: 1337

Add Hardhat accounts to metamask to play with

```
npx hardhat node
```

Take note and import wallets into metamask via their private keys.

# Deployment localhost

Erc20:

```
npx hardhat run scripts/deploy-erc20.ts --network localhost
```

Take note of the resulting deployment contract address.

Hardhat will use Account #0 as deployer, hence total supply will be assigned to this account.

Import assets into Metamask using the contract address it was deployed to, token balance will then show up.

Erc20Faucet:

change `tokenAddress` in script to match the address erc20 contract was deployed to

```
npx hardhat run scripts/deploy-erc20Faucet.ts --network localhost
```

# Deployment Ropsten

```
npx hardhat run scripts/deploy-erc20.ts --network ropsten
```

Take note of the resulting deployment contract address.
Change `tokenAddress` in script to match the address erc20 contract was deployed to

```
npx hardhat run scripts/deploy-erc20Faucet.ts --network
```

```
npx hardhat run scripts/deploy-erc20.ts --network ropsten
```

# Notes

Faucet works as a regular external account with some added time limiting functionality.
It needs some initial tokens in balance to start working. Just transfer any amount of tokens to it's address.

When tokens are requested, the faucet uses the token contract itself to transfer from its balance to the requesting account.
