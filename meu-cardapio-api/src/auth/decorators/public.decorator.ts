import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para marcar rotas públicas (sem autenticação)
 * 
 * Uso:
 * @Public()
 * @Get()
 * async rotaPublica() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);


