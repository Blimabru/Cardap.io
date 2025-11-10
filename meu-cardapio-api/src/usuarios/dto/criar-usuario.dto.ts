import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';

/**
 * DTO para criação de usuário (usado pelo Admin)
 */
export class CriarUsuarioDto {
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @IsString({ message: 'Nome completo deve ser texto' })
  nome_completo: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @IsNotEmpty({ message: 'Perfil é obrigatório' })
  @IsUUID('4', { message: 'ID do perfil inválido' })
  id_perfil: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  foto_perfil_url?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}


