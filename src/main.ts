import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { OpenApiNestFactory } from 'nest-openapi-tools';

import { AppModule } from './app.module';
import { VALIDATION_PIPE_OPTIONS } from './shared/constants';
import { RequestIdMiddleware } from './shared/middlewares/request-id/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.use(RequestIdMiddleware);
  app.enableCors();

  /** Swagger configuration*/
  await OpenApiNestFactory.configure(
    app,
    new DocumentBuilder()
      .setTitle('Nestjs API starter')
      .setDescription('Nestjs API description')
      .setVersion('1.0')
      .addBearerAuth(),
    {
      webServerOptions: {
        enabled: true,
        path: 'swagger',
      },
      fileGeneratorOptions: {
        enabled: true,
        outputFilePath: './openapi.yaml', // or ./openapi.json
      },
      clientGeneratorOptions: {
        enabled: true,
        type: 'typescript-axios',
        outputFolderPath: '../typescript-api-client/src',
        additionalProperties:
          'apiPackage=clients,modelPackage=models,withoutPrefixEnums=true,withSeparateModelsAndApi=true',
        openApiFilePath: './openapi.yaml', // or ./openapi.json
        skipValidation: true, // optional, false by default
      },
    },
    {
      operationIdFactory: (c: string, method: string) => method,
    },
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  await app.listen(port);
}
bootstrap();