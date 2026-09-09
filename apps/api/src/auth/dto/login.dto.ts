import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email o nombre de usuario' })
  @IsString()
  identificador!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}
