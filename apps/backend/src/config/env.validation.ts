// LIBRARIES //
import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, validateSync } from 'class-validator';

/** Deployment environments this service recognises. */
export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Shape of the environment this service requires.
 *
 * Validated once at boot. A missing Supabase key fails the process immediately
 * rather than surfacing as a confusing 500 on the first request.
 */
export class EnvironmentVariablesDto {
  @IsEnum(NodeEnvironment)
  @IsOptional()
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  SUPABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  SUPABASE_PUBLISHABLE_KEY!: string;

  @IsString()
  @IsNotEmpty()
  SUPABASE_SECRET_KEY!: string;

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;
}

/**
 * Validates process environment at application boot
 * @param config - Raw environment values supplied by ConfigModule
 * @returns The validated and type-coerced environment
 * @throws Error listing every invalid or missing variable
 */
export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariablesDto {
  const validated = plainToInstance(EnvironmentVariablesDto, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((error) => `  ${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`)
      .join('\n');

    throw new Error(`Invalid environment configuration:\n${details}\n\nCheck apps/backend/.env against .env.example.`);
  }

  return validated;
}
