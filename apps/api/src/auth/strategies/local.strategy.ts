import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../database/models/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // use email instead of username
  }

  async validate(email: string, password: string): Promise<User | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const user = await this.authService.validatePassword(email, password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
