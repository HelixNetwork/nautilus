## Information Architecture
The Nautilus wallet is built based on [Trinity wallet](https://github.com/iotaledger/Nautilus-wallet). Nautilus Architecture allows to manage both the desktop and mobile client of the wallet. At this stage, we have focused on the desktop client but we are planning to introduce the mobile client for the wallet in the future.

This section details the overall flow and gives an overview of Nautilus’s complete feature set which are currently available.
##### [Setup](#setup-1)
- [Seed Generation](#seed-generation)
- [Seed Storage](#seed-storage)

##### [Main dashboard](#dashboard)
- [Account Management](#account-management-1)
- [Node Selection](#node-selection)
- [Polling](#polling)
- [Address Management](#address-management)
- [Snapshot Transition](#transition)
- [Automatic Promotion/Reattachment](#automatic-promotionreattachment)

## Technical Architecture
This section highlights all important APIs used in Nautilus.
- [IRI](#iri)
- [i18next](#i18next)

## Information Architecture
## Setup

#### Seed generation

This section details the seed generation methodology. Ensuring sufficient seed security begins with their generation. Improperly generated seeds are subject to attack.

Helix Network is reliant on the use of binary-based seeds comprised of 64 HBytes. Seeds can only contain the hexadecimal letters **a-f** and the numbers **0-9**.

Seed generation is performed during new seed set up. The user can generate a complete seed, and randomize individual characters through a UI chequerboard. The same algorithm is used for both full seed and individual letter randomizations.

**It is recommended that a user makes at least 16 individual letter randomisations.**

Nautilus seed generation follows a simple algorithm:
```
do {
randomByte = getRandomByte() // randomByte will be from 0 to 255
} while (randomByte > 512) // Keep generating until the number is 512 or less
charIndex = randomByte % 16
 ```

 For an Nautilus seed, it is necessary to generate a set of 16 possible characters. A simple way of producing the necessary characters is to return the remainder from dividing a random byte's numeric value (0-255) by 16. And then using this to index the string of possible characters: `abcdef0123456789`. By using a number range evenly divisible by the divisor it is possible to avoid bias i.e. by restricting the range from 0 to 512.

 The library used to generate random bytes is  [react-native-securerandom](https://github.com/rh389/react-native-securerandom).

#### Seed storage

Nautilus seed security follows two simple rules: minimize the time the seed spends unencrypted in memory, and encrypt the seed at rest storage.

During setup the user will create a password.The seed is stored encrypted and the password is used to decrypt the seed at the point of use. 

The seed is stored encrypted at every possible instance. The only time the seed lies unencrypted in memory is during seed setup i.e. the seed is not encrypted prior to setting a password. This does not pose a problem for security. Encryption is used to mitigate the risk of an attacker gaining access to the application sandbox on a compromised device. If the user is in the process of setting up their seed, it can be safely assumed that their device has not been compromised.


### Account Management

#### Multi-account management

Nautilus provides multi-account support. You can store more than one seed in your wallet. This enables users to split their funds between multiple seeds and access them from within the same application. If you add more than one seed to your Nautilus wallet, you can swap between accounts by pressing the dropdown located at the top of the main application dashboard.

A number of account management functions are provided. These included **View seed**, **View addresses**, **Delete account**, **Add new account** and **Change password**.

#### Node Selection

Nautilus is a lightwallet. It relies on a connection to a full node running the IRI. This means that Nautilus relies on a third party server for accessing address balances and relaying transactions to the Tangle. Light wallets are suitable for devices like smartphones, owing to their lightweight nature.

##### Node balancing

Nautilus provides a built-in node-balancing service.
Should you wish to turn off node balancing, please head to the **Select node** page in **Advanced settings**. It is also possible to add your own **custom node**.

#### Polling

Nautilus carries out a series of network calls to ensure that your wallet information is kept upto date. Polling comprises of two key components: market data and account polling. Latest market data, price data, currency data, transfers and balances are fetched in sequence. Currently MarketData is not made available and will be added when the helix tokens will be added to exchanges.

Please note: **Nautilus does not update account or market information if the application is minimised. Polling only takes place if the app is currently open.**

#### Automatic Promotion/Reattachment

To ensure transactions are confirmed on the Tangle, it is often necessary to promote or reattach them. If it is possible to promote a pending transaction, Nautilus will do so automatically. However it is sometimes necessary to first attach the transaction to the Tangle before then promoting that reattachment. This will also occur automatically.

Please note: **Nautilus does not promote/reattach transfers if the application is minimised. Automatic promotion/reattachment only takes place if the app is currently open.**

#### Address Management

Nautilus is a stateful wallet, meaning that your address balances and transaction history are stored locally on your device. This ensures that loading times are faster and facilitates a wider array of wallet features, including multi-account support.

#### Snapshot Transition

Every so often, a snapshot is performed on the Tangle. Snapshots are performed to condense the size of the Tangle. All transaction data is deleted and only non-zero address balance are retained. As Nautilus is stateful, it will store a copy of your transactional history after a snapshot.

Following a snapshot it is necessary to manually attach addresses. Nautilus provides a feature to do this quickly and automatically. The snapshot transition function can be found in **Advanced settings**. Whenever a snapshot occurs, you should perform a snapshot transition in Nautilus.

## Technical Architecture

#### IRI
Nautilus consumes endpoints from any selected full node for keeping local account up-to-date with the tangle. All communication with the Tangle is made through the [ Pendulum-SDK ](https://github.com/helixNetwork/pendulum-sdk).


#### i18next
Nautilus supports over 25 different languages. The [i18next](https://www.i18next.com/) and [react-i18next](https://react.i18next.com/) localisation libraries are used. [Crowdin](https://crowdin.com/) provides a platform for translators to suggest translations.