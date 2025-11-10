/**
 * ============================================================================
 * PERFIS.DECORATOR.TS - DECORATOR PARA AUTORIZAÇÃO POR PERFIS
 * ============================================================================
 * 
 * Decorator para restringir rotas a perfis específicos.
 * 
 * USO:
 * @Perfis('Administrador', 'Dono')
 * @Get('usuarios')
 * async listar() { ... }
 * 
 * COMPORTAMENTO:
 * - Marca rota com array de perfis permitidos
 * - PerfisGuard lê este metadado
 * - Valida se user.perfil está no array
 * - Se sim: permite acesso
 * - Se não: retorna 403 Forbidden
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Chave usada para armazenar metadado de perfis
 * PerfisGuard busca por esta chave
 */
export const PERFIS_KEY = 'perfis';

/**
 * Decorator @Perfis()
 * 
 * Aceita lista variável de perfis como argumentos.
 * 
 * @param perfis - Lista de perfis permitidos ('Administrador', 'Dono', 'Cliente')
 * @returns Decorator function
 * 
 * EXEMPLOS DE USO:
 * 
 * 1. Apenas Admin:
 * @Perfis('Administrador')
 * @Post('usuarios')
 * async criar() { ... }
 * 
 * 2. Admin OU Dono:
 * @Perfis('Administrador', 'Dono')
 * @Get('pedidos')
 * async listarTodos() { ... }
 * 
 * 3. Todos os perfis (mas precisa estar autenticado):
 * @Perfis('Administrador', 'Dono', 'Cliente')
 * @Get('estatisticas')
 * async stats() { ... }
 * 
 * 4. Qualquer autenticado (não usa @Perfis):
 * @Post('pedidos')
 * async criar() { ... }
 * 
 * IMPORTANTE:
 * - Perfis devem corresponder EXATAMENTE aos nomes no banco
 * - Case-sensitive: "Administrador" ≠ "administrador"
 * - Múltiplos perfis funcionam como OR (Admin OU Dono)
 */
export const Perfis = (...perfis: string[]) => SetMetadata(PERFIS_KEY, perfis);

/**
 * ============================================================================
 * COMO FUNCIONA
 * ============================================================================
 * 
 * 1. Decorator armazena array de perfis como metadado:
 *    @Perfis('Admin', 'Dono') → SetMetadata('perfis', ['Admin', 'Dono'])
 * 
 * 2. PerfisGuard lê metadado na requisição:
 *    const perfisRequeridos = reflector.get('perfis') → ['Admin', 'Dono']
 * 
 * 3. Compara com perfil do usuário:
 *    perfisRequeridos.includes(user.perfil) → true/false
 * 
 * 4. Se true: permite acesso
 *    Se false: lança 403 Forbidden
 * 
 * ============================================================================
 * PERFIS DISPONÍVEIS NO SISTEMA
 * ============================================================================
 * 
 * 1. 'Administrador':
 *    - Acesso total
 *    - Gerenciar usuários
 *    - Gerenciar produtos
 *    - Gerenciar categorias
 *    - Ver todos os pedidos
 *    - Dashboard completo
 * 
 * 2. 'Dono':
 *    - Gerenciar produtos
 *    - Gerenciar categorias
 *    - Ver todos os pedidos
 *    - Dashboard
 *    - NÃO pode gerenciar usuários
 * 
 * 3. 'Cliente':
 *    - Fazer pedidos
 *    - Ver próprios pedidos
 *    - Ver perfil
 *    - NÃO acessa área admin
 */
