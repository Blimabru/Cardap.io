/**
 * ============================================================================
 * PEDIDOS.CONTROLLER.TS - CONTROLLER DE PEDIDOS
 * ============================================================================
 * 
 * Gerencia todo o ciclo de vida dos pedidos do sistema.
 * 
 * FLUXO DE STATUS:
 * Pendente → Confirmado → Em Preparo → Pronto → Saiu para Entrega → Entregue
 *         ↓                                                        ↓
 *      Cancelado ←--------------------------------------------------
 * 
 * PERMISSÕES:
 * - Criar pedido: Qualquer usuário autenticado
 * - Ver todos os pedidos: Admin e Dono
 * - Ver próprios pedidos: Cliente
 * - Atualizar status: Admin e Dono
 * - Cancelar: Cliente (próprios) ou Admin/Dono (qualquer)
 */

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
 * Todas as rotas requerem autenticação JWT
 */
@Controller('pedidos')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  /**
   * POST /pedidos
   * Cria novo pedido
   * 
   * PERMISSÕES: Qualquer usuário autenticado
   * 
   * REQUEST:
   * {
   *   "itens": [
   *     {
   *       "produto_id": "uuid-do-produto",
   *       "quantidade": 2,
   *       "preco_unitario": 45.90
   *     },
   *     ...
   *   ],
   *   "observacoes": "Sem cebola, por favor"
   * }
   * 
   * RESPONSE:
   * {
   *   "id": "uuid",
   *   "numero_pedido": 1,
   *   "status": "Pendente",
   *   "total": 91.80,
   *   "observacoes": "Sem cebola, por favor",
   *   "itens": [...],
   *   "usuario": {...},
   *   "criado_em": "2025-11-10T..."
   * }
   * 
   * COMPORTAMENTO:
   * - Status inicial: "Pendente"
   * - numero_pedido é auto-incrementado
   * - Total é calculado automaticamente (sum de quantidade * preco_unitario)
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
   * Lista todos os pedidos do sistema
   * 
   * PERMISSÕES: Apenas Admin e Dono
   * 
   * QUERY PARAMS (opcional):
   * - status: Filtra por status (ex: ?status=Pendente)
   * 
   * EXEMPLOS:
   * - GET /pedidos → Todos os pedidos
   * - GET /pedidos?status=Pendente → Apenas pendentes
   * - GET /pedidos?status=Em%20Preparo → Apenas em preparo
   * 
   * RESPONSE: Array de pedidos ordenados por data DESC (mais recente primeiro)
   */
  @Get()
  @Perfis('Administrador', 'Dono')
  async listarTodos(@Query('status') status?: StatusPedido) {
    // Se status fornecido como query param, filtra por ele
    if (status) {
      return this.pedidosService.listarPorStatus(status);
    }
    // Senão, retorna todos
    return this.pedidosService.listarTodos();
  }

  /**
   * GET /pedidos/meus
   * Lista pedidos do usuário autenticado
   * 
   * PERMISSÕES: Qualquer usuário autenticado
   * 
   * COMPORTAMENTO:
   * - Cliente vê apenas seus próprios pedidos
   * - Admin/Dono também podem usar esta rota (verão seus próprios pedidos)
   * - Ordenado por data DESC
   * 
   * USO NO FRONTEND:
   * - Tela "Meus Pedidos" do cliente
   * - Tab "Pedidos" do app
   */
  @Get('meus')
  async listarMeusPedidos(@UsuarioAtual() usuario) {
    return this.pedidosService.listarPorUsuario(usuario.id);
  }

  /**
   * GET /pedidos/estatisticas
   * Retorna estatísticas de pedidos para dashboard
   * 
   * PERMISSÕES: Apenas Admin e Dono
   * 
   * RESPONSE:
   * {
   *   "total_pedidos": 150,
   *   "pedidos_pendentes": 5,
   *   "pedidos_confirmados": 3,
   *   "pedidos_em_preparo": 8,
   *   "pedidos_prontos": 2,
   *   "pedidos_em_entrega": 4,
   *   "pedidos_entregues": 125,
   *   "pedidos_cancelados": 3,
   *   "faturamento_total": 12450.50,
   *   "ticket_medio": 83.00
   * }
   * 
   * USO NO FRONTEND:
   * - Dashboard administrativo
   * - Métricas principais da tela Admin
   */
  @Get('estatisticas')
  @Perfis('Administrador', 'Dono')
  async obterEstatisticas() {
    return this.pedidosService.obterEstatisticas();
  }

  /**
   * GET /pedidos/numero/:numero_pedido
   * Busca pedido por número
   * 
   * PERMISSÕES: Apenas Admin e Dono
   * 
   * EXEMPLO: GET /pedidos/numero/42
   * 
   * DIFERENÇA de GET /pedidos/:id:
   * - :id = UUID (interno)
   * - :numero_pedido = Número sequencial (visível ao cliente)
   * 
   * USE CASE:
   * - Buscar pedido pelo número que cliente vê
   * - "Cadê o pedido #42?"
   */
  @Get('numero/:numero_pedido')
  @Perfis('Administrador', 'Dono')
  async buscarPorNumero(@Param('numero_pedido') numero_pedido: string) {
    return this.pedidosService.buscarPorNumero(parseInt(numero_pedido, 10));
  }

  /**
   * GET /pedidos/:id
   * Busca pedido por ID
   * 
   * PERMISSÕES: Cliente vê apenas próprios, Admin/Dono veem todos
   * 
   * COMPORTAMENTO:
   * - Admin/Dono: Podem ver qualquer pedido
   * - Cliente: Apenas pedidos onde usuario.id === pedido.usuario.id
   * - Se Cliente tentar ver pedido de outro: Erro 403
   * 
   * RESPONSE:
   * {
   *   "id": "uuid",
   *   "numero_pedido": 1,
   *   "status": "Confirmado",
   *   "total": 91.80,
   *   "observacoes": "...",
   *   "itens": [
   *     {
   *       "id": "uuid",
   *       "produto": { "name": "Pizza", "image_url": "..." },
   *       "quantidade": 2,
   *       "preco_unitario": 45.90,
   *       "subtotal": 91.80
   *     }
   *   ],
   *   "usuario": { "nome_completo": "João", ... },
   *   "criado_em": "...",
   *   "atualizado_em": "..."
   * }
   */
  @Get(':id')
  async buscarPorId(
    @Param('id') id: string,
    @UsuarioAtual() usuario
  ) {
    const pedido = await this.pedidosService.buscarPorId(id);

    // AUTORIZAÇÃO: Se não é Admin/Dono, só pode ver seus próprios pedidos
    if (usuario.perfil !== 'Administrador' && usuario.perfil !== 'Dono') {
      if (pedido.usuario.id !== usuario.id) {
        throw new Error('Você não tem permissão para visualizar este pedido');
      }
    }

    return pedido;
  }

  /**
   * PUT /pedidos/:id/status
   * Atualiza status do pedido
   * 
   * PERMISSÕES: Apenas Admin e Dono
   * 
   * REQUEST:
   * {
   *   "novo_status": "Em Preparo"
   * }
   * 
   * STATUS VÁLIDOS:
   * - "Pendente"
   * - "Confirmado"
   * - "Em Preparo"
   * - "Pronto"
   * - "Saiu para Entrega"
   * - "Entregue"
   * - "Cancelado"
   * 
   * COMPORTAMENTO:
   * - Valida transições de status (ex: não pode ir de Entregue para Pendente)
   * - atualizado_em é atualizado automaticamente
   * 
   * USO NO FRONTEND:
   * - Tela "Gerenciar Pedidos"
   * - Admin/Dono clica no badge de status
   * - Seleciona novo status
   * - Frontend chama esta rota
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
   * 
   * PERMISSÕES:
   * - Cliente: Pode cancelar apenas seus próprios pedidos
   * - Admin/Dono: Podem cancelar qualquer pedido
   * 
   * COMPORTAMENTO:
   * - Define status como "Cancelado"
   * - Valida se pedido pode ser cancelado (não pode cancelar se já entregue)
   * - Se Cliente: Valida se é dono do pedido
   * - Se Admin/Dono: Pode cancelar qualquer pedido
   * 
   * REGRAS DE NEGÓCIO (implementadas no service):
   * - Pedidos "Entregue" NÃO podem ser cancelados
   * - Pedidos "Cancelado" já estão cancelados (retorna erro ou ignora)
   * - Outros status podem ser cancelados
   * 
   * USO NO FRONTEND:
   * - Botão "Cancelar Pedido" na tela de detalhes
   * - Aparece apenas se status permite cancelamento
   */
  @Put(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @UsuarioAtual() usuario
  ) {
    // Service valida permissões (se cliente, valida se é dono do pedido)
    return this.pedidosService.cancelar(id, usuario.id);
  }
}

/**
 * ============================================================================
 * FLUXO TÍPICO DE UM PEDIDO
 * ============================================================================
 * 
 * 1. CLIENTE FAZ PEDIDO:
 *    POST /pedidos → Status: "Pendente"
 * 
 * 2. DONO CONFIRMA:
 *    PUT /pedidos/:id/status { "novo_status": "Confirmado" }
 * 
 * 3. COZINHA PREPARA:
 *    PUT /pedidos/:id/status { "novo_status": "Em Preparo" }
 * 
 * 4. PEDIDO FICA PRONTO:
 *    PUT /pedidos/:id/status { "novo_status": "Pronto" }
 * 
 * 5. ENTREGADOR SAI:
 *    PUT /pedidos/:id/status { "novo_status": "Saiu para Entrega" }
 * 
 * 6. CLIENTE RECEBE:
 *    PUT /pedidos/:id/status { "novo_status": "Entregue" }
 * 
 * OU CANCELAMENTO (em qualquer etapa antes de Entregue):
 *    PUT /pedidos/:id/cancelar → Status: "Cancelado"
 */
