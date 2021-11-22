import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth/auth.service';
import { LocalStrategy } from './auth/local.strategy';
import { DbService } from './database/db.service';
import { WalletService } from './wallet/wallet.service';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [DbService, WalletService, AuthService, LocalStrategy],
  exports: [DbService, WalletService, AuthService],
})
export class InfraModule {}
