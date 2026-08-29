// LIBRARIES //
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Login request payload.
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
