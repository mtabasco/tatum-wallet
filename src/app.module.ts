import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { AppController } from './app.controller';
import { InfraModule } from './infra/infra.module';

@Module({
  imports: [UsersModule, InfraModule],
  controllers: [AppController, UsersController],
  providers: [UsersService],
})
export class AppModule {}
