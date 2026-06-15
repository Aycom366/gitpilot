import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RedisService } from '../redis/redis.service';
import { RedisKeys, OTT_TTL, REFRESH_TOKEN_TTL } from '../redis/redis-keys';
import { UsersService } from '../users/users.service';
import { User } from '../database/models/user.entity';
import { RegisterDto } from './dto/register.dto';
import { AuthTokens } from '@gitpilot/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    // Check active (non-deleted) accounts first
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Check if a soft-deleted account exists for this email.
    // If so, restore it with fresh credentials rather than hitting the unique constraint.
    const deleted = await this.usersService.findByEmailIncludeDeleted(
      dto.email,
    );
    const user = deleted
      ? await this.usersService.restoreAndUpdate(deleted.id, {
          name: dto.name,
          passwordHash,
          githubId: null,
          githubUsername: null,
          encryptedApiKey: null,
          apiKeyIv: null,
          tier: 'free',
          preferredProvider: 'google',
        })
      : await this.usersService.create({
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
    // 1. Active account matched by GitHub ID
    let user = await this.usersService.findByGithubId(profile.githubId);
    if (user) return user;

    // 2. Soft-deleted account matched by GitHub ID — restore it
    const deletedByGithub =
      await this.usersService.findByGithubIdIncludeDeleted(profile.githubId);
    if (deletedByGithub) {
      return this.usersService.restoreAndUpdate(deletedByGithub.id, {
        name: profile.name,
        githubUsername: profile.githubUsername,
        encryptedApiKey: null,
        apiKeyIv: null,
        tier: 'free',
        preferredProvider: 'google',
      });
    }

    // 3. Active account matched by email — link GitHub to it
    user = await this.usersService.findByEmail(profile.email);
    if (user) {
      return this.usersService.update(user.id, {
        githubId: profile.githubId,
        githubUsername: profile.githubUsername,
      });
    }

    // 4. Soft-deleted account matched by email — restore and link GitHub
    const deletedByEmail = await this.usersService.findByEmailIncludeDeleted(
      profile.email,
    );
    if (deletedByEmail) {
      return this.usersService.restoreAndUpdate(deletedByEmail.id, {
        name: profile.name,
        githubId: profile.githubId,
        githubUsername: profile.githubUsername,
        passwordHash: null,
        encryptedApiKey: null,
        apiKeyIv: null,
        tier: 'free',
        preferredProvider: 'google',
      });
    }

    // 5. Brand new user
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
    const userId = await this.redis.get(RedisKeys.refreshToken(refreshToken));
    if (!userId)
      throw new UnauthorizedException('Invalid or expired refresh token');

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    // Rotate — revoke old, issue new
    await this.redis.del(RedisKeys.refreshToken(refreshToken));
    return this.issueTokens(user);
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────

  async logout(refreshToken: string): Promise<void> {
    await this.redis.del(RedisKeys.refreshToken(refreshToken));
  }

  // ─── OTT (extension link flow) ───────────────────────────────────────────────

  async generateOtt(userId: string): Promise<string> {
    const ott = crypto.randomUUID();
    await this.redis.set(RedisKeys.ott(ott), userId, OTT_TTL);
    return ott;
  }

  async exchangeOtt(ott: string): Promise<AuthTokens> {
    const userId = await this.redis.get(RedisKeys.ott(ott));
    if (!userId) throw new UnauthorizedException('OTT invalid or expired');

    // Single use — delete immediately
    await this.redis.del(RedisKeys.ott(ott));

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    return this.issueTokens(user);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomUUID();
    await this.redis.set(
      RedisKeys.refreshToken(refreshToken),
      user.id,
      REFRESH_TOKEN_TTL,
    );

    return { accessToken, refreshToken };
  }
}
