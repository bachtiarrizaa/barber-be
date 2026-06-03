import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Logger,
  ValidationPipe,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { appConfig } from './config/app.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors) => {
        const customErrors = errors.flatMap((error) => {
          const constraints = error.constraints || {};
          return Object.values(constraints).map((message) => ({
            field: error.property,
            message: message,
          }));
        });
        return new UnprocessableEntityException({
          message: 'Validation failed',
          errors: customErrors,
        });
      },
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(appConfig.port, () => {
    Logger.log(`Server running on port ` + appConfig.port);
  });
}

void bootstrap();
