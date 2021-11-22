import { Injectable } from '@nestjs/common';
import { Wallet } from 'src/users/entities/user.entity';
import {
  Currency,
  getTransactionsByCustomer,
  generateDepositAddress,
  Fiat,
  createAccounts,
  offchainTransferEthKMS,
  offchainTransferPolygonKMS,
  offchainTransferCeloKMS,
  createNewSubscription,
  SubscriptionType,
} from '@tatumio/tatum';
import { CreateAccountsBatch } from '@tatumio/tatum/dist/src/model/request/CreateAccountsBatch';

const fs = require('fs');
const WALLET_FILE = 'wallets.json';


@Injectable()
export class WalletService {
  async generateAccounts(userId: string): Promise<any> {
    const WEBHOOK_URL = process.env.WEBHOOK_URL;
    const walletFile = fs.readFileSync(WALLET_FILE);
    const walletData = JSON.parse(walletFile);

    let ethItem, maticItem, celoItem;

    try {
      for (const key in walletData) {

        const item = walletData[key];

        if (!ethItem || !maticItem || !celoItem) {
          switch (item.chain) {
            case 'ETH':
              if (!ethItem && item.available) {
                ethItem = item;
                ethItem.signatureId = key;
                break;
              }
              continue;
            case 'CELO':
              if (!celoItem && item.available) {
                celoItem = item;
                celoItem.signatureId = key;
                break;
              }
              continue;
            case 'MATIC':
              if (!maticItem && item.available) {
                maticItem = item;
                maticItem.signatureId = key;
                break;
              }
              continue;
          }
          walletData[key].available = false;
        } else {
          break;
        }
      }

      if (!ethItem || !celoItem || !maticItem) {
        throw new Error('Accounts not available');
      }

      const accountsInput: CreateAccountsBatch = {
        accounts: [
          {
            currency: Currency.ETH,
            xpub: ethItem.xpub,
            accountingCurrency: Fiat.USD,
            customer: { externalId: userId },
          },
          {
            currency: Currency.MATIC,
            xpub: maticItem.xpub,
            accountingCurrency: Fiat.USD,
            customer: { externalId: userId },
          },
          {
            currency: Currency.CELO,
            xpub: celoItem.xpub,
            accountingCurrency: Fiat.USD,
            customer: { externalId: userId },
          },
        ],
      };

      const accounts = await createAccounts(accountsInput);

      const customerId = accounts[0].customerId;
      const { id: ethAccountId } = accounts[0];
      const { id: maticAccountId } = accounts[1];
      const { id: celoAccountId } = accounts[2];

      const ethAddress = (await generateDepositAddress(ethAccountId)).address;
      const maticAddress = (await generateDepositAddress(maticAccountId)).address;
      const celoAddress = (await generateDepositAddress(celoAccountId)).address;

      fs.writeFileSync(WALLET_FILE, JSON.stringify(walletData));

      Promise.all([
        createNewSubscription({
          type: SubscriptionType.ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION,
          attr: {
            id: ethAccountId,
            url: WEBHOOK_URL,
          },
        }),
        createNewSubscription({
          type: SubscriptionType.ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION,
          attr: {
            id: maticAccountId,
            url: WEBHOOK_URL,
          },
        }),
        createNewSubscription({
          type: SubscriptionType.ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION,
          attr: {
            id: celoAccountId,
            url: WEBHOOK_URL,
          },
        }),
      ]).catch((err) => {
        console.log(err);
        throw new Error('Error creating accounts subscription');
      });

      return {
        tatumCustomerId: customerId,
        ethAddress,
        ethAccountId,
        ethSignatureId: ethItem.signatureId,
        maticAddress,
        maticAccountId,
        maticSignatureId: maticItem.signatureId,
        celoAddress,
        celoAccountId,
        celoSignatureId: celoItem.signatureId,
      };
    } catch (error) {
      throw error;
    }
  }

  async getTransactionByCustomerId(tatumCustomerId: string) {
    const transactions = await getTransactionsByCustomer({
      id: tatumCustomerId,
    });
    return transactions;
  }

  async sendTransaction(
    asset: string,
    userWallet: Wallet,
    recipient: string,
    amount: string,
  ) {
    const currency = asset as Currency;

    try {
      let result;
      switch (currency) {
        case Currency.ETH:
          result = await offchainTransferEthKMS({
            signatureId: userWallet.ethSignatureId,
            index: 1,
            senderAccountId: userWallet.ethAccountId,
            address: recipient,
            amount,
          });
          break;
        case Currency.MATIC:
          result = await offchainTransferPolygonKMS({
            signatureId: userWallet.maticSignatureId,
            index: 1,
            senderAccountId: userWallet.maticAccountId,
            address: recipient,
            amount,
          });
          break;
        case Currency.CELO:
          result = await offchainTransferCeloKMS({
            signatureId: userWallet.celoSignatureId,
            index: 1,
            senderAccountId: userWallet.celoAccountId,
            address: recipient,
            amount,
          });
          break;
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
