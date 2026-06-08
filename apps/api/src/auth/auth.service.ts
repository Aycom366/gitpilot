import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { User } from '../database/models/user.entity';
import { RegisterDto } from './dto/register.dto';
import { AuthTokens } from '@gitpilot/shared-types';
import { OTT_TTL, REFRESH_TTL } from 'src/utils/constant';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return this.issueTokens(user);
  }

  // ─── Email / Password validation (used by LocalStrategy) ─────────────────────

  async validatePassword(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const match = await bcrypt.compare(password, user.passwordHash);
    return match ? user : null;
  }

  // ─── Login (called after LocalStrategy validates) ────────────────────────────

  async login(user: User): Promise<AuthTokens> {
    return this.issueTokens(user);
  }

  // ─── GitHub OAuth ─────────────────────────────────────────────────────────────

  async findOrCreateGithubUser(profile: {
    githubId: string;
    githubUsername: string;
    name: string;
    email: string;
  }): Promise<User> {
    // 1. Try match by GitHub ID
    let user = await this.usersService.findByGithubId(profile.githubId);
    if (user) return user;

    // 2. Try match by email — link GitHub to existing account
    user = await this.usersService.findByEmail(profile.email);
    if (user) {
      return this.usersService.update(user.id, {
        githubId: profile.githubId,
        githubUsername: profile.githubUsername,
      });
    }

    // 3. Create new user
    return this.usersService.create({
      name: profile.name,
      email: profile.email,
      githubId: profile.githubId,
      githubUsername: profile.githubUsername,
    });
  }

  async loginGithub(user: User): Promise<AuthTokens> {
    return this.issueTokens(user);
  }

  // ─── Token refresh ────────────────────────────────────────────────────────────

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const userId = await this.redis.get(`refresh:${refreshToken}`);
    if (!userId)
      throw new UnauthorizedException('Invalid or expired refresh token');

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    // Rotate — revoke old, issue new
    await this.redis.del(`refresh:${refreshToken}`);
    return this.issueTokens(user);
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────

  async logout(refreshToken: string): Promise<void> {
    await this.redis.del(`refresh:${refreshToken}`);
  }

  // ─── OTT (extension link flow) ───────────────────────────────────────────────

  async generateOtt(userId: string): Promise<string> {
    const ott = crypto.randomUUID();
    await this.redis.set(`ott:${ott}`, userId, OTT_TTL);
    return ott;
  }

  async exchangeOtt(ott: string): Promise<AuthTokens> {
    const userId = await this.redis.get(`ott:${ott}`);
    if (!userId) throw new UnauthorizedException('OTT invalid or expired');

    // Single use — delete immediately
    await this.redis.del(`ott:${ott}`);

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    return this.issueTokens(user);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomUUID();
    await this.redis.set(`refresh:${refreshToken}`, user.id, REFRESH_TTL);

    return { accessToken, refreshToken };
  }
}
