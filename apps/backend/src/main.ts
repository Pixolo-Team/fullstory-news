// POLYFILL //
// Must be evaluated before any decorated class is loaded. ESM evaluates
// imports in declaration order, so this stays above the standard groups.
import 'reflect-metadata';

// TYPES //
import type { AppConfigData } from '@/config/app.config.js';

// CONFIG //
import { buildAppConfig } from '@/config/app.config.js';

// SERVICES //
import { AppModule } from '@/app.module.js';

// UTILS //
import { DomainExceptionFilter } from '@/common/filters/domain-exception.filter.js';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor.js';

// LIBRARIES //
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Prefix applied to every route. */
const API_PREFIX = 'api';

/** Path the Swagger UI is served from. */
const DOCS_PATH = 'api/docs';

/**
 * Configures CORS from the validated environment
 * @param app - The Nest application instance
 * @param config - Application settings
 */
function configureCors(app: Awaited<ReturnType<typeof NestFactory.create>>, config: AppConfigData): void {
  // An empty CORS_ORIGINS in development means "allow anything". In production
  // it means the list was not configured, which must not silently allow all.
  const allowAll = config.corsOrigins.length === 0 && !config.isProduction;

  app.enableCors({
    origin: allowAll ? true : config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
}

/**
 * Mounts Swagger UI, in non-production environments only
 * @param app - The Nest application instance
 * @param config - Application settings
 */
function configureSwagger(app: Awaited<ReturnType<typeof NestFactory.create>>, config: AppConfigData): void {
  if (config.isProduction) return;

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Full Story API')
      .setDescription(
        'Backend for the Full Story website. Resources are named "article"; the public UI calls them Stories.',
      )
      .setVersion('0.1.0')
      .addBearerAuth()
      .build(),
  );

  SwaggerModule.setup(DOCS_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}

/**
 * Boots the HTTP server
 * @returns Resolves once the server is listening
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = buildAppConfig(app.get(ConfigService));

  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  configureCors(app, config);
  configureSwagger(app, config);

  await app.listen(config.port);

  logger.log(`Full Story API listening on http://localhost:${config.port}/${API_PREFIX}`);
  if (!config.isProduction) {
    logger.log(`Swagger UI at http://localhost:${config.port}/${DOCS_PATH}`);
  }
}

void bootstrap();
