# Nautilus Wallet<img align="right" src="https://hlx.ai/images/Helix_Logo-white.svg" height="70px" />

The Official Desktop Wallet for Managing Helix tokens (HLX) developed by the [Helix Foundation](https://www.hlx.ai). The wallet is built based on the [Trinity Wallet](https://github.com/iotaledger/trinity-wallet). 

-   **Latest release:** v1.0.0 
-   **License:** GPLv3

Special thanks to all of the [IOTA Contributors](https://github.com/iotaledger/trinity-wallet/graphs/contributors)!

## Prerequisites

- Node.js (10.16.0)
- Electron (npm install electron -g)
- Yarn >= v1.16.0
- Python 2.7


On **Windows** platforms you'll need to install build tools to compile native modules:

```
# Install Visual C++ Build Tools and Python 2.7
npm install --global --production windows-build-tools --vs2015

# Install OpenSSL VC++ Static 64bit Library
git clone https://github.com/Microsoft/vcpkg C:\src\vcpkg
cd C:\src\vcpkg
.\bootstrap-vcpkg.bat
.\vcpkg install openssl:x64-windows-static
```
Additionally on **Windows 7** install [.NET Framework 4.5.1](https://www.microsoft.com/en-us/download/details.aspx?id=40773)

On **Linux** platforms you'll need to install additional packages to compile native modules:

```
sudo apt install build-essential libudev-dev libusb-1.0-0 libusb-1.0-0-dev
sudo apt install gcc-4.8 g++-4.8 && export CXX=g++-4.8

```
## Instructions

1. Clone this repo
```
git clone https://github.com/netobjex/wallet.git
```

2. Go to the wallet directory
```
cd wallet
```

3. Install dependencies
```
yarn run install-app
```

4. Run desktop application
```
yarn run start
```

5. Package app for windows , mac and linux

```
cd src/desktop
yarn run build

# For windows
yarn run compile:win

# For linux
yarn run compile:linux

# For mac, You should be on mac OS
```

## Discussion

Discuss Nautilus Wallet in our [discord](https://discord.gg/Mh6Tafg).

## Want to Contribute?

Awesome :heart: :heart:. See our contribution [guidelines](https://github.com/netobjex/wallet/blob/documentation/contributing.MD).

## Licence Information

See our licence information [here](LICENSE)
