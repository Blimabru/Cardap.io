/**
 * ============================================================================
 * AUTH.CONTROLLER.TS - CONTROLLER DE AUTENTICAÇÃO
 * ============================================================================
 * 
 * Este controller gerencia todas as operações de autenticação do sistema:
 * - Login (gera token JWT)
 * - Registro de novos usuários (apenas perfil Cliente)
 * - Validação de token
 * - Busca de dados do usuário autenticado
 * 
 * ROTAS DISPONÍVEIS:
 * - POST /auth/login (pública)
 * - POST /auth/registro (pública)
 * - GET /auth/perfil (protegida)
 * - GET /auth/validar (protegida)
 * 
 * SEGURANÇA:
 * - Rotas públicas usam @Public() para permitir acesso sem token
 * - Rotas protegidas requerem token JWT válido no header Authorization
 * - Senhas são SEMPRE removidas das respostas
 */

import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { Public } from './decorators/public.decorator';
import { UsuarioAtual } from './decorators/usuario-atual.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Controller de Autenticação
 * 
 * @Controller('auth') = Define o prefixo de rota /auth
 * 
 * Exemplo: POST /auth/login, GET /auth/perfil
 * 
 * INJEÇÃO DE DEPENDÊNCIA:
 * - AuthService é injetado via construtor
 * - readonly garante que não pode ser reatribuído
 */
@Controller('auth')
export class AuthController {
  /**
   * Construtor do Controller
   * 
   * @param authService - Service que contém a lógica de autenticação
   * 
   * NestJS injeta automaticamente o AuthService quando este controller
   * é instanciado.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * ========================================================================
   * POST /auth/login
   * ========================================================================
   * 
   * ROTA PÚBLICA - Permite login sem token JWT
   * 
   * FUNÇÃO:
   * Autentica usuário e retorna token JWT para uso em requisições futuras
   * 
   * REQUEST BODY (LoginDto):
   * {
   *   "email": "admin@cardapio.com",
   *   "senha": "admin123"
   * }
   * 
   * RESPONSE (Sucesso - 200):
   * {
   *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "usuario": {
   *     "id": "uuid",
   *     "nome_completo": "Administrador",
   *     "email": "admin@cardapio.com",
   *     "perfil": {
   *       "nome_perfil": "Administrador"
   *     }
   *   }
   * }
   * 
   * RESPONSE (Erro - 401):
   * {
   *   "statusCode": 401,
   *   "message": "Email ou senha inválidos"
   * }
   * 
   * VALIDAÇÕES:
   * - Email deve ser válido
   * - Senha deve ter no mínimo 6 caracteres
   * - Usuário deve existir no banco
   * - Senha deve corresponder ao hash armazenado
   * - Usuário deve estar ativo
   * 
   * @Public() - Decorator que marca rota como pública (não requer JWT)
   * @Post('login') - Define método HTTP POST e path 'login'
   * @Body() - Extrai body da requisição e valida com LoginDto
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Delega lógica para AuthService
    // Service valida credenciais, gera token JWT e retorna usuário
    return this.authService.login(loginDto);
  }

  /**
   * ========================================================================
   * POST /auth/registro
   * ========================================================================
   * 
   * ROTA PÚBLICA - Permite registro de novos clientes
   * 
   * FUNÇÃO:
   * Registra novo usuário no sistema com perfil "Cliente"
   * Usuários Admin e Dono devem ser criados por um Admin via /usuarios
   * 
   * REQUEST BODY (RegistroDto):
   * {
   *   "nome_completo": "João Silva",
   *   "email": "joao@email.com",
   *   "telefone": "(11) 98765-4321",
   *   "senha": "senha123"
   * }
   * 
   * RESPONSE (Sucesso - 201):
   * {
   *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "usuario": {
   *     "id": "uuid",
   *     "nome_completo": "João Silva",
   *     "email": "joao@email.com",
   *     "telefone": "(11) 98765-4321",
   *     "perfil": {
   *       "nome_perfil": "Cliente"
   *     }
   *   }
   * }
   * 
   * RESPONSE (Erro - 409):
   * {
   *   "statusCode": 409,
   *   "message": "Email já cadastrado"
   * }
   * 
   * VALIDAÇÕES:
   * - Nome completo obrigatório
   * - Email válido e único
   * - Senha mínimo 6 caracteres
   * - Telefone opcional
   * 
   * COMPORTAMENTO:
   * - Perfil "Cliente" é atribuído automaticamente
   * - Senha é hashada com bcrypt antes de salvar
   * - Token JWT é gerado automaticamente
   * - Usuário pode fazer login imediatamente após registro
   * 
   * @Public() - Rota pública (qualquer pessoa pode se registrar)
   * @Post('registro') - POST /auth/registro
   */
  @Public()
  @Post('registro')
  async registro(@Body() registroDto: RegistroDto) {
    // Delega para AuthService
    // Service cria usuário com perfil Cliente, gera token e retorna
    return this.authService.registro(registroDto);
  }

  /**
   * ========================================================================
   * GET /auth/perfil
   * ========================================================================
   * 
   * ROTA PROTEGIDA - Requer token JWT válido
   * 
   * FUNÇÃO:
   * Retorna dados completos do usuário autenticado
   * 
   * REQUEST HEADERS:
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * 
   * RESPONSE (Sucesso - 200):
   * {
   *   "id": "uuid",
   *   "nome_completo": "Administrador",
   *   "email": "admin@cardapio.com",
   *   "telefone": null,
   *   "ativo": true,
   *   "criado_em": "2025-11-10T...",
   *   "atualizado_em": "2025-11-10T...",
   *   "perfil": {
   *     "id": "uuid",
   *     "nome_perfil": "Administrador"
   *   }
   * }
   * 
   * RESPONSE (Erro - 401):
   * {
   *   "statusCode": 401,
   *   "message": "Token inválido ou expirado"
   * }
   * 
   * SEGURANÇA:
   * - Token JWT é validado pelo JwtAuthGuard (global)
   * - Senha NUNCA é retornada
   * - Apenas dados do próprio usuário são retornados
   * 
   * USO TÍPICO:
   * Frontend usa essa rota para:
   * - Carregar dados do usuário ao abrir app
   * - Validar se token ainda é válido
   * - Atualizar dados do usuário no estado global
   * 
   * @Get('perfil') - GET /auth/perfil
   * @UsuarioAtual() - Decorator customizado que extrai usuário do token JWT
   */
  @Get('perfil')
  async obterPerfil(@UsuarioAtual() usuario) {
    // UsuarioAtual() decorator extrai dados do payload do JWT
    // usuario = { id, email, perfil } (dados básicos do token)
    
    // Busca usuário COMPLETO do banco (não só do token)
    // Isso garante dados atualizados (caso tenha mudado após login)
    const usuarioCompleto = await this.authService.validarUsuario(usuario.id);
    
    // SEGURANÇA: Remove senha_hash do retorno
    // NUNCA retornar senha, mesmo hashada
    const { senha_hash, ...usuarioSemSenha } = usuarioCompleto as any;
    
    // Retorna usuário completo sem senha
    return usuarioSemSenha;
  }

  /**
   * ========================================================================
   * GET /auth/validar
   * ========================================================================
   * 
   * ROTA PROTEGIDA - Valida se token JWT ainda é válido
   * 
   * FUNÇÃO:
   * Verifica se o token JWT é válido e ainda não expirou
   * 
   * REQUEST HEADERS:
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * 
   * RESPONSE (Sucesso - 200):
   * {
   *   "valido": true,
   *   "usuario": {
   *     "id": "uuid",
   *     "email": "admin@cardapio.com",
   *     "perfil": "Administrador"
   *   }
   * }
   * 
   * RESPONSE (Erro - 401):
   * {
   *   "statusCode": 401,
   *   "message": "Token inválido ou expirado"
   * }
   * 
   * USO TÍPICO:
   * Frontend usa essa rota para:
   * - Verificar se usuário ainda está autenticado ao abrir app
   * - Validar token antes de fazer operações críticas
   * - Decidir se redireciona para login ou não
   * 
   * IMPORTANTE:
   * Se essa rota retornar 401, frontend deve:
   * 1. Remover token do storage
   * 2. Redirecionar para tela de login
   * 3. Limpar estado do usuário
   * 
   * @Get('validar') - GET /auth/validar
   * @UsuarioAtual() - Extrai dados do token JWT
   */
  @Get('validar')
  async validarToken(@UsuarioAtual() usuario) {
    // Se chegou aqui, token é válido
    // (JwtAuthGuard já validou antes de chegar neste método)
    
    // Retorna confirmação e dados básicos do usuário
    return {
      valido: true,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  }
}

/**
 * ============================================================================
 * FLUXO DE AUTENTICAÇÃO
 * ============================================================================
 * 
 * 1. REGISTRO (primeira vez):
 *    POST /auth/registro → Cria usuário → Gera token → Retorna token
 * 
 * 2. LOGIN (próximas vezes):
 *    POST /auth/login → Valida credenciais → Gera token → Retorna token
 * 
 * 3. USAR SISTEMA (com token):
 *    Qualquer requisição → Header: Authorization: Bearer <token>
 *    → JwtAuthGuard valida → Permite acesso
 * 
 * 4. VALIDAR TOKEN (periodicamente):
 *    GET /auth/validar → Verifica se token ainda é válido
 *    Se 401 → Redireciona para login
 * 
 * 5. BUSCAR DADOS DO USUÁRIO (ao abrir app):
 *    GET /auth/perfil → Retorna dados completos do usuário
 * 
 * ============================================================================
 * TOKEN JWT
 * ============================================================================
 * 
 * ESTRUTURA DO TOKEN:
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.PAYLOAD.SIGNATURE
 * 
 * PAYLOAD (decodificado):
 * {
 *   "id": "uuid-do-usuario",
 *   "email": "email@usuario.com",
 *   "perfil": "Administrador",
 *   "iat": 1699999999,  // Issued At (quando foi criado)
 *   "exp": 1700604799   // Expiration (quando expira)
 * }
 * 
 * EXPIRAÇÃO:
 * - Definida em JWT_EXPIRES_IN (.env)
 * - Padrão: 7d (7 dias)
 * - Após expirar, usuário precisa fazer login novamente
 * 
 * SEGURANÇA:
 * - Token é assinado com JWT_SECRET
 * - Não pode ser falsificado sem a chave secreta
 * - Backend valida assinatura em cada requisição
 */


