/**
 * ============================================================================
 * PERFIS.GUARD.TS - GUARD DE AUTORIZAÇÃO POR PERFIS
 * ============================================================================
 * 
 * Este Guard implementa AUTORIZAÇÃO (o que você pode fazer).
 * 
 * DIFERENÇA ENTRE GUARDS:
 * - JwtAuthGuard: AUTENTICAÇÃO - "Quem você é?" (valida token)
 * - PerfisGuard: AUTORIZAÇÃO - "O que você pode fazer?" (valida perfil)
 * 
 * FUNÇÃO:
 * - Verifica se usuário tem perfil necessário para acessar rota
 * - Executado APÓS JwtAuthGuard (precisa de req.user)
 * - Permite restringir rotas por perfil (Admin, Dono, Cliente)
 * 
 * EXEMPLOS:
 * - Apenas Admin pode criar usuários
 * - Admin e Dono podem ver todos os pedidos
 * - Qualquer autenticado pode criar pedido
 * 
 * USO:
 * @Perfis('Administrador') → Apenas Admin
 * @Perfis('Administrador', 'Dono') → Admin OU Dono
 * (sem decorator) → Qualquer autenticado
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERFIS_KEY } from '../decorators/perfis.decorator';

/**
 * Guard de autorização por perfis
 * 
 * Implementa CanActivate do NestJS para controlar acesso às rotas
 * @Injectable() marca como provider injetável
 */
@Injectable()
export class PerfisGuard implements CanActivate {
  /**
   * Construtor do Guard
   * 
   * @param reflector - Utilitário para ler metadados de decorators
   *                    Usado para ler @Perfis('Admin', 'Dono')
   */
  constructor(private reflector: Reflector) {}

  /**
   * canActivate - Método principal do Guard
   * 
   * Decide se requisição pode prosseguir baseado no perfil do usuário.
   * 
   * @param context - Contexto da execução
   * @returns boolean - true = permite, false = bloqueia
   * 
   * FLUXO:
   * 1. Busca perfis requeridos do decorator @Perfis()
   * 2. Se não há restrição: permite qualquer autenticado
   * 3. Se há restrição: verifica se perfil do usuário está na lista
   * 4. Se sim: permite acesso
   * 5. Se não: lança 403 Forbidden
   */
  canActivate(context: ExecutionContext): boolean {
    /**
     * Busca perfis requeridos do decorator @Perfis()
     * 
     * getAllAndOverride procura em:
     * - Método do controller (ex: @Perfis('Admin') no método criar())
     * - Classe do controller (ex: @Perfis('Admin') no controller inteiro)
     * 
     * Retorna array de strings: ['Administrador', 'Dono']
     * Ou undefined se não houver decorator
     */
    const perfisRequeridos = this.reflector.getAllAndOverride<string[]>(PERFIS_KEY, [
      context.getHandler(),  // Método do controller
      context.getClass(),    // Classe do controller
    ]);

    /**
     * Se não há perfis requeridos, permite qualquer autenticado
     * 
     * Isso significa que a rota:
     * - Tem @Public() (não chegaria aqui, JwtAuthGuard já liberou) OU
     * - Não tem @Perfis() (qualquer autenticado pode acessar)
     * 
     * Exemplo:
     * @Post('pedidos')  // Qualquer autenticado pode criar pedido
     * async criar(...) { ... }
     */
    if (!perfisRequeridos || perfisRequeridos.length === 0) {
      return true; // Sem restrição de perfil
    }

    /**
     * Extrai usuário da requisição
     * 
     * req.user foi anexado pelo JwtAuthGuard (executou antes)
     * 
     * user contém:
     * {
     *   id: "uuid",
     *   email: "admin@cardapio.com",
     *   perfil: "Administrador"  ← Usado aqui
     * }
     */
    const { user } = context.switchToHttp().getRequest();

    /**
     * Validação de segurança: usuário deve existir
     * 
     * Se user não existe, significa que JwtAuthGuard falhou
     * (não deveria acontecer, mas melhor garantir)
     */
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    /**
     * Verifica se perfil do usuário está na lista de perfis permitidos
     * 
     * Exemplo:
     * perfisRequeridos = ['Administrador', 'Dono']
     * user.perfil = 'Administrador'
     * temPermissao = true (permite acesso)
     * 
     * Exemplo 2:
     * perfisRequeridos = ['Administrador']
     * user.perfil = 'Cliente'
     * temPermissao = false (bloqueia acesso)
     */
    const temPermissao = perfisRequeridos.includes(user.perfil);

    /**
     * Se não tem permissão, lança erro 403 Forbidden
     * 
     * DIFERENÇA ENTRE 401 E 403:
     * - 401 Unauthorized: Não está autenticado (sem token ou token inválido)
     * - 403 Forbidden: Está autenticado mas não tem permissão (perfil errado)
     * 
     * Mensagem personalizada informa qual perfil falta
     */
    if (!temPermissao) {
      throw new ForbiddenException(
        `Acesso negado. Perfil '${user.perfil}' não tem permissão para acessar este recurso.`
      );
    }

    /**
     * Se chegou aqui, usuário tem permissão!
     * Permite acesso ao controller method
     */
    return true;
  }
}

/**
 * ============================================================================
 * EXEMPLOS DE USO NO CONTROLLER
 * ============================================================================
 * 
 * EXEMPLO 1: Apenas Administrador
 * ```typescript
 * @Post('usuarios')
 * @Perfis('Administrador')  // ← Apenas Admin pode criar usuários
 * async criar(@Body() dto: CriarUsuarioDto) {
 *   return this.usuariosService.criar(dto);
 * }
 * ```
 * 
 * Resultado:
 * - Admin: ✅ Acesso permitido
 * - Dono: ❌ 403 Forbidden
 * - Cliente: ❌ 403 Forbidden
 * 
 * EXEMPLO 2: Admin OU Dono
 * ```typescript
 * @Get('pedidos')
 * @Perfis('Administrador', 'Dono')  // ← Admin OU Dono
 * async listarTodos() {
 *   return this.pedidosService.listarTodos();
 * }
 * ```
 * 
 * Resultado:
 * - Admin: ✅ Acesso permitido
 * - Dono: ✅ Acesso permitido
 * - Cliente: ❌ 403 Forbidden
 * 
 * EXEMPLO 3: Qualquer autenticado
 * ```typescript
 * @Post('pedidos')
 * // Sem @Perfis() = qualquer autenticado pode
 * async criar(@Body() dto: CriarPedidoDto, @UsuarioAtual() usuario) {
 *   return this.pedidosService.criar(usuario.id, dto);
 * }
 * ```
 * 
 * Resultado:
 * - Admin: ✅ Acesso permitido
 * - Dono: ✅ Acesso permitido
 * - Cliente: ✅ Acesso permitido
 * 
 * EXEMPLO 4: Rota pública
 * ```typescript
 * @Public()  // ← Ignora JwtAuthGuard, não chega no PerfisGuard
 * @Get('products')
 * async findAll() {
 *   return this.productsService.findAll();
 * }
 * ```
 * 
 * Resultado:
 * - Qualquer pessoa (mesmo sem login): ✅ Acesso permitido
 * 
 * ============================================================================
 * FLUXO COMPLETO DE UMA REQUISIÇÃO
 * ============================================================================
 * 
 * EXEMPLO: POST /usuarios (criar usuário)
 * 
 * 1. Frontend envia:
 *    POST /usuarios
 *    Authorization: Bearer <token>
 *    Body: { "nome_completo": "João", ... }
 * 
 * 2. CORS valida origem
 * 
 * 3. ValidationPipe valida DTO
 * 
 * 4. JwtAuthGuard executa:
 *    ✓ Extrai token
 *    ✓ Valida assinatura e expiração
 *    ✓ Busca usuário no banco
 *    ✓ Anexa req.user = { id, email, perfil: "Cliente" }
 * 
 * 5. PerfisGuard executa (ESTE ARQUIVO):
 *    ✓ Busca @Perfis('Administrador') do método
 *    ✓ Verifica: user.perfil === 'Administrador'?
 *    ✗ Resultado: 'Cliente' !== 'Administrador'
 *    ✗ Lança: 403 Forbidden "Acesso negado. Perfil 'Cliente' não tem permissão..."
 * 
 * 6. Resposta retorna ao frontend:
 *    Status: 403
 *    Body: { "statusCode": 403, "message": "Acesso negado. ..." }
 * 
 * ============================================================================
 * BOAS PRÁTICAS
 * ============================================================================
 * 
 * 1. SEMPRE especificar @Perfis() em rotas sensíveis:
 *    - Criar/editar/deletar usuários → @Perfis('Administrador')
 *    - Ver todos os pedidos → @Perfis('Administrador', 'Dono')
 *    - Ver dashboard → @Perfis('Administrador', 'Dono')
 * 
 * 2. NÃO usar @Perfis() em rotas que qualquer autenticado pode acessar:
 *    - Criar pedido
 *    - Ver próprios pedidos
 *    - Ver próprio perfil
 * 
 * 3. Usar @Public() apenas em rotas que NÃO precisam de autenticação:
 *    - Login
 *    - Registro
 *    - Ver produtos
 *    - Ver categorias
 * 
 * 4. TESTAR com todos os perfis:
 *    - Admin deve acessar tudo
 *    - Dono deve acessar apenas recursos de gestão
 *    - Cliente deve acessar apenas seus dados
 * 
 * 5. Mensagens de erro claras:
 *    - 401: "Token inválido" → Problema de autenticação
 *    - 403: "Perfil X não tem permissão" → Problema de autorização
 */
