import { Injectable } from '@nestjs/common';
import { DbService } from 'src/infra/database/db.service';
import { WalletService } from 'src/infra/wallet/wallet.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, Wallet } from './entities/user.entity';
import { randomUUID } from 'crypto';
const bcrypt = require('bcrypt');


@Injectable()
export class UsersService {
  constructor(
    private dbService: DbService,
    private walletService: WalletService,
  ) { }

  async findOneById(id: string): Promise<User | undefined> {
    return this.dbService.readUserById(id);
  }

  async findOneByName(name: string): Promise<User | undefined> {
    return this.dbService.readUserByName(name);
  }

  async create(user: CreateUserDto): Promise<any> {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser: User = {
      id: randomUUID(),
      name: user.name,
      password: hashedPassword,
    };

    const walletData = await this.walletService.generateAccounts(newUser.id);

    newUser.wallet = walletData;

    await this.dbService.saveUser(newUser); 

    return newUser;
  }

  async getTransactions(tatumCustomerId: string) {
    return this.walletService.getTransactionByCustomerId(tatumCustomerId);
  }

  async sendTransaction(
    asset: string,
    userId: string,
    recipient: string,
    amount: string,
  ) {
    const user = this.dbService.readUserById(userId);

    return this.walletService.sendTransaction(
      asset,
      user.wallet,
      recipient,
      amount,
    );
  }
}
