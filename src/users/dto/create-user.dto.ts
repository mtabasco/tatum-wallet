import { IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(6, 10)
  name: string;

  @IsNotEmpty()
  @Length(8, 10)
  password: string;
}
