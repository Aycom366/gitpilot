import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../database/models/user.entity';
import { GenerateService } from './generate.service';
import { GenerateCommitDto } from './dto/generate-commit.dto';
import { GeneratePrDto } from './dto/generate-pr.dto';
import { GenerateBranchDto } from './dto/generate-branch.dto';

@Controller('generate')
@UseGuards(JwtAuthGuard)
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post('commit')
  generateCommit(@Req() req: Request, @Body() dto: GenerateCommitDto) {
    return this.generateService.generateCommit(req.user as User, dto);
  }

  @Post('pr')
  generatePr(@Req() req: Request, @Body() dto: GeneratePrDto) {
    return this.generateService.generatePr(req.user as User, dto);
  }

  @Post('branch')
  generateBranch(@Req() req: Request, @Body() dto: GenerateBranchDto) {
    return this.generateService.generateBranch(req.user as User, dto);
  }

  @Get('usage')
  getUsage(@Req() req: Request) {
    return this.generateService.getUsage(req.user as User);
  }
}
