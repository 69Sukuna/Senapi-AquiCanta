import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Departamento, Role } from '@repo/database';
import { ROLES_GESTIONABLES, vacioANull } from './crear-usuario.dto';

// Todo opcional: solo se cambia lo que viene. "" en username/name/departamento
// los vacía (null); "" en password significa "no cambiarla".
export class ActualizarUsuarioDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @ApiPropertyOptional()
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

  @ApiPropertyOptional({ minLength: 8, maxLength: 72, description: 'Vacío = no cambiar la contraseña' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72)
  password?: string;

  @ApiPropertyOptional({ enum: ROLES_GESTIONABLES })
  @IsOptional()
  @IsIn(ROLES_GESTIONABLES, { message: 'El rol debe ser ADMIN o USER' })
  role?: Role;

  @ApiPropertyOptional({ enum: Departamento })
  @Transform(vacioANull)
  @IsOptional()
  @IsEnum(Departamento)
  departamento?: Departamento | null;
}
