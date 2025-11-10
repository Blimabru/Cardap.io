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
 * Gerencia login, registro e validação de usuários
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Login de usuário
   * 
   * @Public - Não requer autenticação
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/registro
   * Registro de novo cliente
   * 
   * @Public - Não requer autenticação
   */
  @Public()
  @Post('registro')
  async registro(@Body() registroDto: RegistroDto) {
    return this.authService.registro(registroDto);
  }

  /**
   * GET /auth/perfil
   * Retorna dados do usuário autenticado
   * 
   * Requer autenticação JWT
   */
  @Get('perfil')
  async obterPerfil(@UsuarioAtual() usuario) {
    return {
      id: usuario.id,
      email: usuario.email,
      nome_completo: usuario.nome_completo,
      perfil: usuario.perfil,
      permissoes: usuario.permissoes,
    };
  }

  /**
   * GET /auth/validar
   * Valida se o token JWT ainda é válido
   * 
   * Requer autenticação JWT
   */
  @Get('validar')
  async validarToken(@UsuarioAtual() usuario) {
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


