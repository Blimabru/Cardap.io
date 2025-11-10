/**
 * ============================================================================
 * JWT-AUTH.GUARD.TS - GUARD DE AUTENTICAÇÃO JWT
 * ============================================================================
 * 
 * Este Guard é CRUCIAL para a segurança do sistema.
 * 
 * FUNÇÃO:
 * - Protege TODAS as rotas automaticamente (configurado globalmente no app.module.ts)
 * - Valida token JWT em cada requisição
 * - Permite exceções para rotas públicas (via @Public())
 * 
 * FLUXO DE EXECUÇÃO (para cada requisição):
 * 1. Requisição chega no servidor
 * 2. Este Guard é executado ANTES do controller
 * 3. Verifica se rota tem @Public() decorator:
 *    - Se sim: Permite acesso sem validar token
 *    - Se não: Valida token JWT do header Authorization
 * 4. Se token válido: Extrai usuário e continua
 * 5. Se token inválido/ausente: Retorna 401 Unauthorized
 * 
 * COMO FUNCIONA A VALIDAÇÃO JWT:
 * - Herda de AuthGuard('jwt') do Passport
 * - Passport executa JwtStrategy para validar token
 * - JwtStrategy decodifica token, valida assinatura e expiraç
ão
 * - Se válido: user é anexado à requisição (req.user)
 * - Se inválido: Lança exceção 401
 * 
 * IMPORTANTE:
 * - Este Guard é executado ANTES do PerfisGuard
 * - Primeiro valida autenticação (quem você é)
 * - Depois PerfisGuard valida autorização (o que pode fazer)
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard de autenticação JWT
 * 
 * Estende AuthGuard('jwt') do Passport para usar estratégia JWT
 * @Injectable() marca como provider injetável do NestJS
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Construtor do Guard
   * 
   * @param reflector - Utilitário do NestJS para ler metadados de decorators
   *                    Usado para verificar se rota tem @Public()
   */
  constructor(private reflector: Reflector) {
    // Chama construtor da classe pai (AuthGuard)
    super();
  }

  /**
   * canActivate - Método principal do Guard
   * 
   * Decide se a requisição pode prosseguir ou não.
   * 
   * @param context - Contexto da execução (contém info sobre requisição, handler, etc)
   * @returns boolean | Promise<boolean> - true = permite acesso, false = bloqueia
   * 
   * FLUXO:
   * 1. Verifica se rota é pública (tem @Public())
   * 2. Se pública: retorna true (permite sem validar token)
   * 3. Se não pública: chama super.canActivate() (valida JWT via Passport)
   * 4. Passport executa JwtStrategy.validate()
   * 5. Se válido: anexa user à req e retorna true
   * 6. Se inválido: lança exceção 401
   */
  canActivate(context: ExecutionContext) {
    /**
     * Busca metadados do decorator @Public()
     * 
     * getAllAndOverride busca o decorator em:
     * - context.getHandler() = Método do controller (@Get(), @Post(), etc)
     * - context.getClass() = Classe do controller (@Controller())
     * 
     * Se encontrar IS_PUBLIC_KEY em qualquer nível, retorna true
     */
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),  // Ex: método login() com @Public()
      context.getClass(),    // Ex: controller inteiro com @Public() (raro)
    ]);

    /**
     * Se rota é pública, permite acesso imediato
     * 
     * Exemplos de rotas públicas:
     * - POST /auth/login
     * - POST /auth/registro
     * - GET /products (qualquer pessoa pode ver produtos)
     * - GET /categories
     */
    if (isPublic) {
      return true;
    }

    /**
     * Se não é pública, valida JWT via Passport
     * 
     * super.canActivate(context) faz:
     * 1. Extrai token do header: Authorization: Bearer <token>
     * 2. Passa token para JwtStrategy.validate()
     * 3. JwtStrategy decodifica e valida:
     *    - Assinatura correta? (usando JWT_SECRET)
     *    - Token expirou? (verifica exp do payload)
     *    - Payload é válido?
     * 4. Se tudo OK:
     *    - Busca usuário no banco (via authService.validarUsuario)
     *    - Anexa usuário à requisição (req.user = usuario)
     *    - Retorna true
     * 5. Se falhar:
     *    - Lança UnauthorizedException (401)
     *    - Requisição é bloqueada
     */
    return super.canActivate(context);
  }
}

/**
 * ============================================================================
 * EXEMPLOS DE USO
 * ============================================================================
 * 
 * ROTA PÚBLICA (não valida JWT):
 * ```typescript
 * @Public()
 * @Post('login')
 * async login(@Body() loginDto: LoginDto) {
 *   return this.authService.login(loginDto);
 * }
 * ```
 * 
 * ROTA PROTEGIDA (valida JWT):
 * ```typescript
 * @Get('perfil')
 * async obterPerfil(@UsuarioAtual() usuario) {
 *   // usuario já está validado e disponível aqui
 *   return usuario;
 * }
 * ```
 * 
 * ============================================================================
 * CABEÇALHO AUTHORIZATION
 * ============================================================================
 * 
 * Frontend deve enviar token JWT no header:
 * 
 * ```typescript
 * fetch('http://localhost:3000/auth/perfil', {
 *   headers: {
 *     'Authorization': `Bearer ${token}`,
 *     'Content-Type': 'application/json'
 *   }
 * })
 * ```
 * 
 * Formato do header:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InV1aWQi...
 *                ^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                palavra "Bearer" + espaço + token JWT
 * 
 * ============================================================================
 * ERROS COMUNS
 * ============================================================================
 * 
 * 401 Unauthorized:
 * - Token ausente (header Authorization não enviado)
 * - Token inválido (assinatura não confere)
 * - Token expirado (exp passou)
 * - Token malformado (não é JWT válido)
 * 
 * Soluções:
 * - Verificar se frontend está enviando header Authorization
 * - Verificar se JWT_SECRET é o mesmo no .env e no código
 * - Verificar se token não expirou (fazer login novamente)
 * - Usar console.log para debug do token no frontend
 * 
 * ============================================================================
 * ORDEM DE EXECUÇÃO DOS GUARDS
 * ============================================================================
 * 
 * 1. JwtAuthGuard (este arquivo) - AUTENTICAÇÃO
 *    ↓ Valida: Você é quem diz ser? (token válido?)
 *    ↓ Se sim: anexa req.user
 *    ↓ Se não: retorna 401
 * 
 * 2. PerfisGuard - AUTORIZAÇÃO
 *    ↓ Valida: Você pode fazer isso? (perfil correto?)
 *    ↓ Usa req.user do passo 1
 *    ↓ Se sim: permite acesso
 *    ↓ Se não: retorna 403
 * 
 * 3. Controller Method
 *    ↓ Executa lógica de negócio
 *    ↓ Retorna resposta
 */
