import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para definir perfis autorizados em uma rota
 * 
 * Uso:
 * @Perfis('Administrador', 'Dono')
 * @Get()
 * async rotaRestrita() { ... }
 */
export const PERFIS_KEY = 'perfis';
export const Perfis = (...perfis: string[]) => SetMetadata(PERFIS_KEY, perfis);


