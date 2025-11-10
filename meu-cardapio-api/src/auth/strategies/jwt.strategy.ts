import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

/**
 * Estratégia JWT para autenticação
 * 
 * Valida o token JWT e extrai os dados do usuário
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'cardapio_jwt_secret_2025_super_seguro',
    });
  }

  /**
   * Valida o payload do token JWT
   * 
   * @param payload Dados do token
   * @returns Dados do usuário validado
   */
  async validate(payload: any) {
    // Busca usuário no banco para garantir que ainda existe e está ativo
    const usuario = await this.authService.validarUsuario(payload.sub);

    return {
      id: usuario.id,
      email: usuario.email,
      nome_completo: usuario.nome_completo,
      perfil: usuario.perfil.nome_perfil,
      id_perfil: usuario.perfil.id,
      permissoes: usuario.perfil.permissoes,
    };
  }
}


