import { PartialType } from '@nestjs/mapped-types';
import { CriarUsuarioDto } from './criar-usuario.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO para atualização de usuário
 * Todos os campos são opcionais
 */
export class AtualizarUsuarioDto extends PartialType(CriarUsuarioDto) {
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  nova_senha?: string;
}


