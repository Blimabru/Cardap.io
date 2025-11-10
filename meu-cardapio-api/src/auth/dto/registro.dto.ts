import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

/**
 * DTO para registro de novo usuário
 */
export class RegistroDto {
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @IsString({ message: 'Nome completo deve ser texto' })
  nome_completo: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  foto_perfil_url?: string;
}


