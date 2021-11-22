import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByName(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return {
        id: user.id,
        wallet: user.wallet,
      };
    }
    return null;
  }
}