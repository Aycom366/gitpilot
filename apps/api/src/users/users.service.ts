import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/models/user.entity';
import { ProviderName } from '@gitpilot/shared-types';
import { encrypt, decrypt } from '../utils/crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.repo.findOneBy({ githubId });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.repo.update(id, data);
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, name: string): Promise<User> {
    return this.update(id, { name });
  }

  async saveApiKey(
    id: string,
    apiKey: string,
    provider: ProviderName,
  ): Promise<User> {
    const { encrypted, iv, authTag } = encrypt(apiKey);
    return this.update(id, {
      encryptedApiKey: `${encrypted}:${authTag}`,
      apiKeyIv: iv,
      preferredProvider: provider,
      tier: 'byok',
    });
  }

  async removeApiKey(id: string): Promise<User> {
    return this.update(id, {
      encryptedApiKey: null,
      apiKeyIv: null,
      tier: 'free',
    });
  }

  /**
   * Decrypts and returns the stored API key for BYOK users.
   * Used internally by the generate module — never exposed via API.
   */
  decryptApiKey(user: User): string | null {
    if (!user.encryptedApiKey || !user.apiKeyIv) return null;
    const [encrypted, authTag] = user.encryptedApiKey.split(':');
    return decrypt(encrypted, user.apiKeyIv, authTag);
  }

  async updatePreferredProvider(
    id: string,
    provider: ProviderName,
  ): Promise<User> {
    return this.update(id, { preferredProvider: provider });
  }
}
