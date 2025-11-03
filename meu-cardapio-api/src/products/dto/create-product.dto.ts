import { Type } from 'class-transformer';
import {
    IsNotEmpty, IsNumber,
    IsOptional,
    IsString,
    IsUrl, IsUUID,
    Max // 1. Importe IsOptional, Min, Max
    ,
    Min,
    MinLength
} from 'class-validator';
  
  export class CreateProductDto {
    // ... (name, description, price, imageUrl, categoryId) ...
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;
  
    @IsString()
    @IsNotEmpty()
    description: string;
  
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    price: number;
  
    @IsUrl()
    @IsNotEmpty()
    imageUrl: string;
  
    @IsUUID()
    @IsNotEmpty()
    categoryId: string;
  
    // --- ADICIONE ESTE BLOCO ---
    @IsNumber()
    @IsOptional() // O '?' torna o campo opcional
    @Min(0)       // A nota mínima é 0
    @Max(10)      // A nota máxima é 10 (baseado no 9,3 do seu layout)
    @Type(() => Number)
    rating?: number; // O '?' marca como opcional no TypeScript
    // --- FIM DO BLOCO ---
  }