import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  UseGuards,
  Query
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { AtualizarStatusPedidoDto } from './dto/atualizar-status-pedido.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator';
import { StatusPedido } from './entities/pedido.entity';

/**
 * Controller de Pedidos
 * 
 * Gerencia todo o ciclo de vida dos pedidos
 * Permissões variam por perfil (Cliente, Dono, Admin)
 */
@Controller('pedidos')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  /**
   * POST /pedidos
   * Cria novo pedido (qualquer usuário autenticado)
   */
  @Post()
  async criar(
    @UsuarioAtual() usuario,
    @Body() criarPedidoDto: CriarPedidoDto
  ) {
    return this.pedidosService.criar(usuario.id, criarPedidoDto);
  }

  /**
   * GET /pedidos
   * Lista todos os pedidos (Admin e Dono)
   */
  @Get()
  @Perfis('Administrador', 'Dono')
  async listarTodos(@Query('status') status?: StatusPedido) {
    if (status) {
      return this.pedidosService.listarPorStatus(status);
    }
    return this.pedidosService.listarTodos();
  }

  /**
   * GET /pedidos/meus
   * Lista pedidos do usuário autenticado
   */
  @Get('meus')
  async listarMeusPedidos(@UsuarioAtual() usuario) {
    return this.pedidosService.listarPorUsuario(usuario.id);
  }

  /**
   * GET /pedidos/estatisticas
   * Retorna estatísticas de pedidos (Admin e Dono)
   */
  @Get('estatisticas')
  @Perfis('Administrador', 'Dono')
  async obterEstatisticas() {
    return this.pedidosService.obterEstatisticas();
  }

  /**
   * GET /pedidos/numero/:numero_pedido
   * Busca pedido por número (Admin e Dono)
   */
  @Get('numero/:numero_pedido')
  @Perfis('Administrador', 'Dono')
  async buscarPorNumero(@Param('numero_pedido') numero_pedido: string) {
    return this.pedidosService.buscarPorNumero(parseInt(numero_pedido, 10));
  }

  /**
   * GET /pedidos/:id
   * Busca pedido por ID
   * Cliente vê apenas seus pedidos, Admin/Dono veem todos
   */
  @Get(':id')
  async buscarPorId(
    @Param('id') id: string,
    @UsuarioAtual() usuario
  ) {
    const pedido = await this.pedidosService.buscarPorId(id);

    // Se não é Admin/Dono, só pode ver seus próprios pedidos
    if (usuario.perfil !== 'Administrador' && usuario.perfil !== 'Dono') {
      if (pedido.usuario.id !== usuario.id) {
        throw new Error('Você não tem permissão para visualizar este pedido');
      }
    }

    return pedido;
  }

  /**
   * PUT /pedidos/:id/status
   * Atualiza status do pedido (Admin e Dono)
   */
  @Put(':id/status')
  @Perfis('Administrador', 'Dono')
  async atualizarStatus(
    @Param('id') id: string,
    @Body() atualizarStatusDto: AtualizarStatusPedidoDto
  ) {
    return this.pedidosService.atualizarStatus(id, atualizarStatusDto);
  }

  /**
   * PUT /pedidos/:id/cancelar
   * Cancela pedido
   * Cliente pode cancelar seus próprios pedidos, Admin/Dono podem cancelar qualquer um
   */
  @Put(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @UsuarioAtual() usuario
  ) {
    return this.pedidosService.cancelar(id, usuario.id);
  }
}


