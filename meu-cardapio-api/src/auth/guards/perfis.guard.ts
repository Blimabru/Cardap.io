import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERFIS_KEY } from '../decorators/perfis.decorator';

/**
 * Guard de autorização por perfis
 * 
 * Verifica se o usuário tem o perfil necessário para acessar a rota
 */
@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca perfis requeridos na rota
    const perfisRequeridos = this.reflector.getAllAndOverride<string[]>(PERFIS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!perfisRequeridos || perfisRequeridos.length === 0) {
      return true; // Sem restrição de perfil
    }

    // Extrai usuário da requisição (já validado pelo JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verifica se o perfil do usuário está na lista de perfis permitidos
    const temPermissao = perfisRequeridos.includes(user.perfil);

    if (!temPermissao) {
      throw new ForbiddenException(
        `Acesso negado. Perfil '${user.perfil}' não tem permissão para acessar este recurso.`
      );
    }

    return true;
  }
}


