import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DbService } from 'src/infra/database/db.service';
import { WalletService } from 'src/infra/wallet/wallet.service';

@Module({
  //controllers: [UsersController],
  providers: [UsersService, DbService, WalletService],
  exports: [UsersService],
})
export class UsersModule {}
