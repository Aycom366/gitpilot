import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import * as Sentry from '@sentry/nestjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/debug-sentry')
  getError() {
    // Send a log before throwing the error
    Sentry.logger.info('User triggered test error', {
      action: 'test_error_endpoint',
    });
    throw new InternalServerErrorException('Test Sentry error!');
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
