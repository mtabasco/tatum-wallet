export interface Wallet {
  tatumCustomerId: string;
  ethAddress?: string;
  ethAccountId?: string;
  ethSignatureId?: string;
  maticAddress?: string;
  maticAccountId?: string;
  maticSignatureId?: string;
  celoAddress?: string;
  celoAccountId?: string;
  celoSignatureId?: string;
}

export interface User {
  id: string;
  name: string;
  password: string;
  wallet?: Wallet;
}
