# Folder Structure

- /: workspace root
- /packages/app: frontend dapp
- /packages/harhat: contracts

# Workspace creation

- create root package.json

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

## dapp

- scaffold nextjs project at packages/dapp

```
npx create-next-app@latest --typescript
```

- change name/version in package.json for later cross package referencing:

```json
{
  "name": "@demo-dapp-erc20/dapp",
  "version": "1.0.0"
}
```

Note: rm -rf .git created by nextjs scaffolding

## hardhat

- create package.json at packages/hardhat

```json
{
  "name": "@demo-dapp-erc20/hardhat",
  "version": "1.0.0"
}
```

- add hardhat local dev depency

```
npm install --save-dev hardhat
```

- scaffold hardhat ts project

```
npx hardhat
```
