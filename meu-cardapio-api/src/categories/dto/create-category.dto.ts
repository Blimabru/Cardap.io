// Importe os validadores (já vêm instalados com o NestJS)
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()         // Deve ser um texto
  @IsNotEmpty()       // Não pode ser vazio
  @MinLength(3)       // Deve ter pelo menos 3 caracteres
  name: string;
}