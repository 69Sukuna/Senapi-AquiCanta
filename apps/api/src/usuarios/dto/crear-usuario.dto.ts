import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Departamento, Role } from '@repo/database';

// Solo estos dos roles se gestionan desde el panel; ARTIST existe en el enum
// pero todavía no tiene pantallas.
export const ROLES_GESTIONABLES: Role[] = [Role.ADMIN, Role.USER];

// El formulario manda "" en los campos opcionales que se dejan vacíos.
export const vacioANull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export class CrearUsuarioDto {
  @ApiProperty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @ApiPropertyOptional({ description: 'Alternativa al email para iniciar sesión. Sin "@" (para no confundirse con un email).' })
  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'El usuario solo puede tener letras, números, punto, guion y guion bajo' })
  username?: string | null;

  @ApiPropertyOptional()
  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string | null;

  // bcrypt solo considera los primeros 72 bytes: se limita para no aceptar
  // una contraseña larga que en realidad se truncaría en silencio.
  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72)
  password!: string;

  @ApiProperty({ enum: ROLES_GESTIONABLES })
  @IsIn(ROLES_GESTIONABLES, { message: 'El rol debe ser ADMIN o USER' })
  role!: Role;

  @ApiPropertyOptional({ enum: Departamento, description: 'Obligatorio si el rol es USER; se ignora para ADMIN.' })
  @Transform(vacioANull)
  @IsOptional()
  @IsEnum(Departamento)
  departamento?: Departamento | null;
}
