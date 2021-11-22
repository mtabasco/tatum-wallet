import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Session,
  Response,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggedInGuard } from 'src/infra/auth/logged-in.guard';
import { CreateTxDto } from './dto/create-tx.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(
    @Session() session: Record<string, any>,
    @Body() createUserDto: CreateUserDto,
  ) {
    try {
      const user = await this.usersService.create(createUserDto);
      session.user = {
        id: user.id,
        tatumCustomerId: user.wallet.tatumCustomerId,
      };

      return {
        id: user.id,
        name: user.name,
        ethAddress: user.wallet.ethAddress,
        maticAddress: user.wallet.maticAddress,
        celoAddress: user.wallet.celoAddress,
      } as ResponseUserDto;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  @UseGuards(LoggedInGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Get('wallet/transactions')
  @UseGuards(LoggedInGuard)
  getTransactions(@Session() session: Record<string, any>) {
    const tatumCustomerId = session.user.wallet.tatumCustomerId;
    return this.usersService.getTransactions(tatumCustomerId);
  }

  @Post('wallet/send-transaction')
  @UseGuards(LoggedInGuard)
  sendTransaction(
    @Body() createTxDto: CreateTxDto,
    @Session() session: Record<string, any>,
  ) {
    return this.usersService.sendTransaction(
      createTxDto.asset,
      session.user.id,
      createTxDto.recipient,
      createTxDto.amount,
    );
  }
}
