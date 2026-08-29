// TYPES //
import type { ConfigService } from '@nestjs/config';

/** Application settings derived from the validated environment. */
export interface AppConfigData {
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  isProduction: boolean;
  sessionCookieName: string;
  sessionCookieMaxAgeMs: number;
  storageBucket: string;
}

/**
 * Builds application settings from the validated environment
 * @param configService - Nest config service holding validated env values
 * @returns Typed application settings
 */
export function buildAppConfig(configService: ConfigService): AppConfigData {
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const rawOrigins = configService.get<string>('CORS_ORIGINS') ?? '';

  return {
    port: Number(configService.get<number>('PORT') ?? 4000),
    nodeEnv,
    corsOrigins: rawOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    isProduction: nodeEnv === 'production',
    sessionCookieName: configService.get<string>('SESSION_COOKIE_NAME') ?? 'fs_session',
    sessionCookieMaxAgeMs: Number(configService.get<number>('SESSION_COOKIE_MAX_AGE_MS') ?? 604800000),
    storageBucket: configService.get<string>('SUPABASE_STORAGE_BUCKET') ?? 'story-images',
  };
}
