import { Controller, Request, Post, UseGuards, Session } from '@nestjs/common';
import { LocalAuthGuard } from './infra/auth/local-auth.guard';
import { User } from './users/entities/user.entity';

@Controller()
export class AppController {
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req, @Session() session: Record<string, any>) {
    if (!session?.user) {
      const user: User = req.user as User;

      session.user = {
        id: user.id,
        wallet: user.wallet,
      };
    }
    return session.user;
  }
}
