# Tatum wallet example

This is an example implementation of a custodial wallet service using https://tatum.io/

It's composed by 2 elements:
- Service: It's responsible of signup, login, send transactions, list transactions
- Tatum KMS https://tatum.io/kms.html: Generates and stores wallets in a secure way.

# Setup

1. Install Tatum KMS: https://github.com/tatumio/tatum-kms
2. After installed, generate 3 test wallets:
	- `tatum-kms generatemanagedwallet ETH --testnet`
 	- `tatum-kms generatemanagedwallet MATIC --testnet`
 	- `tatum-kms generatemanagedwallet CELO --testnet`
3. Run `tatum-kms export` and copy data of generated wallets in a json file `wallets.json` like this:
```json
{
  "dff04680-ffab-4633-8fe3-f322aa4ec8b0": {
    "xpub": "xpub6DrXzde2J31ruJUyF4NNAfPcgUg6pdgfxpDsLBZ7qF9FVWqvQ7jLfdgGqWHS2t9FPeoDxXHhpGXbYj65Z7E7CArcsmSMgzZUnnSWUTgQoxk",
    "chain": "CELO",
    "available": true,
    "signatureId": "dff04680-ffab-4633-8fe3-f322aa4ec8b0"
  },
  "af605c50-7dad-47c1-8bfc-088f06a16d85": {
    "xpub": "xpub6Edsqr8Z2ySF3c5wPuBqZkU4FwoHv3sJzEtC3CH5oWQ71tEZEtE3S9riBb6WzhZSFSfQtndmfaaftToqozRRmnHSTFgayjR1yNt6SUuChVK",
    "chain": "MATIC",
    "available": true,
    "signatureId": "af605c50-7dad-47c1-8bfc-088f06a16d85"
  },
  "73519861-f22a-4398-8105-7161f7f25be5": {
    "xpub": "xpub6FA8Wsrba1Vy7bQncuqkQMvqXHs8Huij1H7MUoPDzd61cynZKFJWUEVQezUues9Xsc2P9raFyuhV8oK8pSciTf2Mp3iCUZS4ja6RobfnMkL",
    "chain": "ETH",
    "available": true,
    "signatureId": "73519861-f22a-4398-8105-7161f7f25be5"
  }
}
```
Note the key of every node is the `signatureId` of every account. Remove mnemonic as it's not used. Add `available: true` on every node. This file will be copied to the root folder of the service repo to allow it to fetch accounts to new users.

4. Clone this repo, run `npm install`
5. Copy `wallets.json`(created before) to root folder
6. Create `.env`file, contents:
`TATUM_API_KEY` the API key generated here: https://dashboard.tatum.io/sign-up (testnet)
`WEBHOOK_URL` webhook url to receive notifications on every deposit for any account. You can generate a test one here: https://webhook.site/
7. run `npm start`
8. Tatum KMS: run `tatum-kms daemon --testnet --api-key {your-api-key}  --chain ETH, CELO, MATIC`
 	
 	
## API

|   Endpoint    | Require auth |Purpose          |Input payload                 |Output payload                 |
|----------------|--------------|-------------|-----------------------------|--------------|
|`/users` POST   | N | Sign up         |`{ "name": string,"password": string}`    | `{ "id": string,  "name": string, "ethAddress": string, "maticAddress": string,  "celoAddress": string }` |
|`/auth/login` GET   | N |  Login         |`{ "name": string,"password": string}`    | `{ "id": string,  "wallet": Wallet }` |
|`/users/wallet/transactions` GET   | Y | Get all accounts transactions (In / Out)        |    | `Transaction[]` |
|`/users/wallet/send-transaction` GET   | Y | Send transaction (ETH, MATIC, CELO)   | `{ "asset": string, "amount": string, "recipient": string }`   | `{ signatureId: string }` |
|`/users/:id` GET   | Y | Get user info         | `:id string`    | `{ "id": string, "name": string, "wallet": Wallet }` |

## How auth and account generation work

For this example, a simple JSON file (`db_data.json`) is used as a database. For every user, one account of every type (ETH, CELO, MATIC) are generated, so you need to generate enough using TATUM KMS and save them into `wallets.json`file.

### Signup flow
1. User calls `/users` with `name` and `password` parameters
2. Service search on `wallets.json` for available accounts (`available=true`)
3. Generate 3 accounts for the user. All belongs to the same Tatum customer Id
4. Setup subscription for every incoming transaction on all accounts, so on that event, a webhook notification is sent.
5. Save user into db
6. Save some information in session (user id and customer id)

## Send transaction

Just call `/users/wallet/send-transaction` with right parameters and you will receive a `signatureId`of the transaction. Check that you have enough funds on the account.
Check logs on KMS daemon to see if the transaction with that `signatureId`is processed.
You can also check tx status calling this endpoint https://tatum.io/apidoc.php#operation/GetPendingTransactionToSign 

##  Project structure

This project is structured following DDD architecture. Two main modules here:
### Users
Handle all user and wallet logic. No major business rules here, mainly application logic using users.service class.
### Infra
Here we have 3 services under the same module. All 3 can be replaced by different providers without altering users classes and logic.
- database: DB service (simple JSON file access logic)
- auth: basic Auth logic using `passport` and local session management
- wallet: Tatum implementation of the wallet features


Have fun!