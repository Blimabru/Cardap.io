/**
 * ============================================================================
 * USUARIO-ATUAL.DECORATOR.TS - DECORATOR PARA OBTER USUÁRIO AUTENTICADO
 * ============================================================================
 * 
 * Decorator de parâmetro customizado para extrair dados do usuário autenticado.
 * 
 * USO:
 * async metodo(@UsuarioAtual() usuario) {
 *   console.log(usuario.id, usuario.email, usuario.perfil);
 * }
 * 
 * FUNÇÃO:
 * - Extrai req.user (anexado pelo JwtAuthGuard)
 * - Injeta nos parâmetros do método do controller
 * - Evita precisar fazer req.user manualmente
 * 
 * DADOS DISPONÍVEIS EM usuario:
 * - id: UUID do usuário
 * - email: Email do usuário
 * - perfil: Nome do perfil ("Administrador", "Dono", "Cliente")
 * 
 * IMPORTANTE:
 * - Só funciona em rotas PROTEGIDAS (não @Public)
 * - Se usar em rota pública, usuario será undefined
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator @UsuarioAtual()
 * 
 * createParamDecorator é função do NestJS para criar decorators de parâmetros.
 * 
 * @param data - Dados passados ao decorator (não usado aqui)
 * @param ctx - Contexto da execução (contém request, response, etc)
 * @returns Usuário extraído de req.user
 * 
 * EXEMPLOS DE USO:
 * 
 * 1. Obter ID do usuário:
 * @Get('perfil')
 * async obterPerfil(@UsuarioAtual() usuario) {
 *   const id = usuario.id;
 *   return this.authService.buscarPorId(id);
 * }
 * 
 * 2. Filtrar dados por usuário:
 * @Get('meus-pedidos')
 * async meusPedidos(@UsuarioAtual() usuario) {
 *   return this.pedidosService.listarPorUsuario(usuario.id);
 * }
 * 
 * 3. Validar permissões:
 * @Put('pedidos/:id/cancelar')
 * async cancelar(
 *   @Param('id') id: string,
 *   @UsuarioAtual() usuario
 * ) {
 *   // Valida se pedido pertence ao usuário
 *   return this.pedidosService.cancelar(id, usuario.id);
 * }
 * 
 * 4. Usar múltiplos decorators:
 * @Post('pedidos')
 * async criar(
 *   @Body() dto: CriarPedidoDto,  // Body da requisição
 *   @UsuarioAtual() usuario         // Usuário autenticado
 * ) {
 *   return this.pedidosService.criar(usuario.id, dto);
 * }
 */
export const UsuarioAtual = createParamDecorator(
  /**
   * Função executada quando decorator é usado
   * 
   * @param data - Parâmetro passado ao decorator (ex: @UsuarioAtual('email'))
   *               Não usado neste caso (sempre retorna usuário completo)
   * @param ctx - ExecutionContext do NestJS
   * @returns Objeto user de req.user
   */
  (data: unknown, ctx: ExecutionContext) => {
    // Obtém objeto request HTTP do contexto
    const request = ctx.switchToHttp().getRequest();
    
    // Retorna usuário anexado pelo JwtAuthGuard
    // request.user = { id, email, perfil }
    return request.user;
  },
);

/**
 * ============================================================================
 * COMO FUNCIONA EM DETALHES
 * ============================================================================
 * 
 * FLUXO COMPLETO:
 * 
 * 1. Requisição chega com token JWT:
 *    GET /auth/perfil
 *    Authorization: Bearer eyJhbGciOiJ...
 * 
 * 2. JwtAuthGuard executa:
 *    - Extrai token
 *    - Valida token
 *    - Decodifica payload: { id, email, perfil, iat, exp }
 *    - Busca usuário no banco
 *    - Anexa à requisição: req.user = { id, email, perfil }
 * 
 * 3. Controller method é chamado:
 *    async obterPerfil(@UsuarioAtual() usuario)
 *    
 * 4. Decorator @UsuarioAtual() executa:
 *    - Extrai req.user
 *    - Injeta como parâmetro 'usuario'
 * 
 * 5. Controller method recebe usuário:
 *    usuario = { id: "uuid", email: "admin@...", perfil: "Admin" }
 * 
 * ============================================================================
 * ESTRUTURA DO OBJETO usuario
 * ============================================================================
 * 
 * O objeto retornado contém:
 * 
 * {
 *   id: "123e4567-e89b-12d3-a456-426614174000",  // UUID do usuário
 *   email: "admin@cardapio.com",                 // Email do usuário
 *   perfil: "Administrador"                      // Nome do perfil
 * }
 * 
 * IMPORTANTE:
 * - Estes dados vêm do TOKEN JWT, não do banco
 * - Se precisar de dados atualizados, busque no banco:
 *   const usuarioCompleto = await this.usuariosService.buscarPorId(usuario.id);
 * 
 * - Senha NUNCA está no token (segurança)
 * 
 * ============================================================================
 * DIFERENÇA ENTRE req.user E BUSCAR NO BANCO
 * ============================================================================
 * 
 * req.user (via @UsuarioAtual()):
 * ✅ Rápido (não faz query no banco)
 * ✅ Dados básicos (id, email, perfil)
 * ❌ Pode estar desatualizado (token gerado há dias)
 * ❌ Não tem telefone, criado_em, etc
 * 
 * Buscar no banco:
 * ✅ Dados atualizados
 * ✅ Dados completos (telefone, datas, etc)
 * ❌ Mais lento (query no banco)
 * ❌ Código extra necessário
 * 
 * QUANDO USAR CADA UM:
 * 
 * Use @UsuarioAtual() quando:
 * - Precisa apenas de id, email ou perfil
 * - Performance é importante
 * - Ex: Filtrar pedidos, criar pedido, etc
 * 
 * Busque no banco quando:
 * - Precisa de dados completos
 * - Dados devem estar atualizados
 * - Ex: GET /auth/perfil, editar perfil
 * 
 * ============================================================================
 * ERROS COMUNS
 * ============================================================================
 * 
 * ERRO 1: usuario é undefined
 * Causa: Rota marcada com @Public()
 * Solução: Remover @Public() ou não usar @UsuarioAtual()
 * 
 * ERRO 2: usuario.nome_completo é undefined
 * Causa: req.user só tem id, email, perfil (do token)
 * Solução: Buscar usuário completo no banco se precisar de mais dados
 * 
 * ERRO 3: Dados desatualizados
 * Causa: Token foi gerado há dias, dados mudaram no banco
 * Solução: Buscar dados atualizados no banco
 * 
 * ============================================================================
 * COMPARAÇÃO COM OUTROS FRAMEWORKS
 * ============================================================================
 * 
 * Express.js:
 * req.user // Manual
 * 
 * NestJS com @UsuarioAtual():
 * @Get()
 * async metodo(@UsuarioAtual() usuario) { ... }  // Automático!
 * 
 * VANTAGENS:
 * ✅ Mais limpo
 * ✅ Type-safe (TypeScript)
 * ✅ Testável
 * ✅ Reutilizável
 */
