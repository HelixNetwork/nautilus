# Helix Wallet
```
WALLET IS IN ACTIVE DEVELOPMENT. CODE IS NOT OPTIMIZED FOR PRODUCTION.
```

## Prerequisites

- Node.js (10.16.0)
- Electron (npm install electron -g)
- Yarn >= v1.16.0

## Instructions

1. Clone this repo
```
git clone https://github.com/netobjex/wallet.git
```

2. Go to the wallet directory
```
cd wallet
```

3. Install the shared dependencies
```
yarn run deps:shared
```

4. Install the desktop dependencies
```
yarn run deps:desktop
```

5. Run desktop application
```
yarn run start:desktop
```

6. Package app for Windows

```
yarn run package:win
```
7. Package app for Linux

```
yarn run package:linux
```
