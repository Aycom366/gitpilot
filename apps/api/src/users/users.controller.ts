import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../database/models/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard) // all user endpoints require auth
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@Req() req: Request) {
    return plainToInstance(User, req.user);
  }

  @Put('me')
  updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = req.user as User;
    return this.usersService.updateProfile(user.id, dto.name!);
  }

  // PUT /users/me/provider
  @Put('me/provider')
  async updateProvider(@Req() req: Request, @Body() dto: UpdateProviderDto) {
    const user = req.user as User;

    if (dto.apiKey) {
      return await this.usersService.saveApiKey(
        user.id,
        dto.apiKey,
        dto.provider,
      );
    }

    return await this.usersService.updatePreferredProvider(
      user.id,
      dto.provider,
    );
  }

  @Delete('me/api-key')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeApiKey(@Req() req: Request) {
    const user = req.user as User;
    return this.usersService.removeApiKey(user.id);
  }

  /**
   * DELETE /users/me
   * Soft-deletes the account and wipes all credentials.
   * Returns 204; the client should clear tokens and redirect to home.
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Req() req: Request) {
    const user = req.user as User;
    await this.usersService.deleteAccount(user.id);
  }
}
