import { IsIn, IsNotEmpty, IsEthereumAddress } from 'class-validator';

export class CreateTxDto {
  @IsNotEmpty()
  @IsIn(['ETH', 'MATIC', 'CELO'])
  asset: string;

  @IsNotEmpty()
  amount: string;

  @IsNotEmpty()
  @IsEthereumAddress()
  recipient: string;
}
