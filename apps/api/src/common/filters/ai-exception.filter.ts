import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { APICallError, AISDKError } from 'ai';

@Catch(AISDKError)
export class AiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AiExceptionFilter.name);

  catch(exception: AISDKError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.BAD_GATEWAY;
    let message = 'AI provider error';

    if (exception instanceof APICallError) {
      this.logger.error(
        `AI provider ${exception.statusCode}: ${exception.message}`,
        exception.url,
      );

      if (exception.statusCode === 401 || exception.statusCode === 403) {
        status = HttpStatus.BAD_GATEWAY;
        message =
          'AI provider rejected the API key. Check your key in settings.';
      } else if (exception.statusCode === 429) {
        status = HttpStatus.TOO_MANY_REQUESTS;
        message = 'AI provider rate limit hit. Try again shortly.';
      } else if (exception.statusCode != null) {
        status = HttpStatus.BAD_GATEWAY;
        message = `AI provider returned ${exception.statusCode}.`;
      }
    } else {
      this.logger.error(
        `AI SDK error [${exception.name}]: ${exception.message}`,
      );
    }

    res.status(status).json({
      statusCode: status,
      error: HttpStatus[status],
      message,
    });
  }
}
