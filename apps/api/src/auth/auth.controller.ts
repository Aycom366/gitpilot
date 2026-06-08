import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ExchangeOttDto } from './dto/exchange-ott.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../database/models/user.entity';
import { config } from 'src/config';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/register
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /auth/login — LocalStrategy validates email/password first
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Req() req: Request) {
    return this.authService.login(req.user as User);
  }

  // GET /auth/github — redirect to GitHub OAuth
  @UseGuards(GithubAuthGuard)
  @Get('github')
  githubAuth() {}

  // GET /auth/github/callback — GitHub redirects back here
  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.loginGithub(req.user as User);
    // Redirect to web dashboard with tokens in query params
    // In prod, prefer a short-lived cookie or postMessage instead of query params

    res.redirect(
      `${config.webUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }

  // POST /auth/refresh
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  // POST /auth/logout
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  // POST /auth/extension-token — web user generates OTT to link extension
  @UseGuards(JwtAuthGuard)
  @Post('extension-token')
  async extensionToken(@Req() req: Request) {
    const user = req.user as User;
    const ott = await this.authService.generateOtt(user.id);
    const extensionId = config.extensionId;
    const deepLink = `chrome-extension://${extensionId}/auth-callback.html?ott=${ott}`;

    return { ott, deepLink };
  }

  // POST /auth/exchange — extension exchanges OTT for JWT pair
  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  exchange(@Body() dto: ExchangeOttDto) {
    return this.authService.exchangeOtt(dto.ott);
  }
}
