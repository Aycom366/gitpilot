import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../auth.service';
import { User } from '../../database/models/user.entity';
import { config } from 'src/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    super({
      clientID: config.githubClientId,
      clientSecret: config.githubClientSecret,
      callbackURL: config.githubCallbackUrl,
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const email = profile.emails?.[0]?.value ?? `${profile.id}@github.noemail`;

    return this.authService.findOrCreateGithubUser({
      githubId: profile.id,
      githubUsername: profile.username ?? '',
      name: profile.displayName || profile.username || 'GitHub User',
      email,
    });
  }
}
