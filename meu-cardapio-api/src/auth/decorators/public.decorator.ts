/**
 * ============================================================================
 * PUBLIC.DECORATOR.TS - DECORATOR PARA ROTAS PÚBLICAS
 * ============================================================================
 * 
 * Decorator customizado para marcar rotas como públicas (sem autenticação).
 * 
 * USO:
 * @Public()
 * @Post('login')
 * async login() { ... }
 * 
 * COMPORTAMENTO:
 * - Marca rota com metadado 'isPublic' = true
 * - JwtAuthGuard lê este metadado
 * - Se encontrar, pula validação de JWT
 * - Permite acesso sem token
 * 
 * ROTAS QUE USAM @Public():
 * - POST /auth/login (login não precisa estar logado!)
 * - POST /auth/registro (criar conta)
 * - GET /products (qualquer pessoa vê produtos)
 * - GET /categories (qualquer pessoa vê categorias)
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Chave usada para armazenar metadado
 * JwtAuthGuard busca por esta chave
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator @Public()
 * 
 * SetMetadata é função do NestJS que anexa metadados a métodos/classes
 * 
 * Quando usado:
 * @Public() → SetMetadata('isPublic', true)
 * 
 * JwtAuthGuard depois lê:
 * reflector.get(IS_PUBLIC_KEY) → retorna true
 * 
 * @returns Decorator function que pode ser aplicado a métodos/classes
 * 
 * EXEMPLO DE USO:
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   
 *   @Public()  // ← Este decorator
 *   @Post('login')
 *   async login(@Body() loginDto: LoginDto) {
 *     // Qualquer pessoa pode fazer login (óbvio!)
 *     return this.authService.login(loginDto);
 *   }
 *   
 *   @Get('perfil')  // SEM @Public() = protegido por JWT
 *   async obterPerfil(@UsuarioAtual() usuario) {
 *     // Apenas usuários autenticados chegam aqui
 *     return usuario;
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * ============================================================================
 * COMO FUNCIONA EM DETALHES
 * ============================================================================
 * 
 * 1. DECORATORS SÃO EXECUTADOS ANTES DA REQUISIÇÃO:
 *    Quando NestJS carrega a aplicação, ele:
 *    - Lê todos os controllers
 *    - Processa todos os decorators (@Get, @Post, @Public, etc)
 *    - Armazena metadados associados a cada rota
 * 
 * 2. DECORATOR @Public() ANEXA METADADO:
 *    @Public() → SetMetadata('isPublic', true)
 *    
 *    Internamente, NestJS armazena:
 *    {
 *      método: login,
 *      rota: '/auth/login',
 *      metadados: {
 *        'isPublic': true  ← Aqui!
 *      }
 *    }
 * 
 * 3. JwtAuthGuard LÊ METADADO:
 *    Quando requisição chega em /auth/login:
 *    
 *    canActivate(context) {
 *      const isPublic = reflector.get('isPublic', context.getHandler());
 *      // isPublic = true
 *      
 *      if (isPublic) {
 *        return true;  // Permite sem validar JWT
 *      }
 *      
 *      // ... validação JWT ...
 *    }
 * 
 * ============================================================================
 * QUANDO USAR @Public()
 * ============================================================================
 * 
 * USE @Public() QUANDO:
 * ✅ Rota não requer autenticação
 * ✅ Qualquer pessoa (mesmo sem conta) pode acessar
 * ✅ Exemplos:
 *    - Login
 *    - Registro
 *    - Ver produtos
 *    - Ver categorias
 *    - Página inicial
 * 
 * NÃO USE @Public() QUANDO:
 * ❌ Rota acessa dados sensíveis
 * ❌ Rota modifica dados do sistema
 * ❌ Precisa saber quem é o usuário
 * ❌ Exemplos:
 *    - Ver perfil do usuário (precisa saber quem é)
 *    - Criar pedido (precisa saber quem está pedindo)
 *    - Ver pedidos (precisa saber quais mostrar)
 *    - Qualquer CRUD de admin
 * 
 * ============================================================================
 * DIFERENÇA ENTRE @Public() E SEM DECORATOR
 * ============================================================================
 * 
 * COM @Public():
 * - JWT NÃO é validado
 * - Qualquer pessoa acessa (mesmo sem token)
 * - req.user NÃO existe
 * 
 * SEM @Public():
 * - JWT é validado (JwtAuthGuard)
 * - Apenas autenticados acessam
 * - req.user existe e contém dados do usuário
 * 
 * ============================================================================
 * HIERARQUIA DE DECORATORS
 * ============================================================================
 * 
 * @Public() > @Perfis()
 * 
 * Se uma rota tem @Public(), o @Perfis() é IGNORADO:
 * 
 * @Public()
 * @Perfis('Administrador')  // ← Ignorado! Rota é pública.
 * @Get('test')
 * async test() { ... }
 * 
 * Resultado: Qualquer pessoa acessa (sem validar perfil)
 * 
 * RAZÃO:
 * - JwtAuthGuard executa primeiro
 * - Se encontra @Public(), retorna true imediatamente
 * - PerfisGuard nunca é executado (guard chain para)
 */
