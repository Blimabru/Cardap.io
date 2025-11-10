import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obter usuário autenticado nos controllers
 * 
 * Uso:
 * async rotaProtegida(@UsuarioAtual() usuario) {
 *   console.log(usuario.id, usuario.email, usuario.perfil);
 * }
 */
export const UsuarioAtual = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);


