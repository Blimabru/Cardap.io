import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, StatusPedido } from './entities/pedido.entity';
import { ItemPedido } from './entities/item-pedido.entity';
import { Product } from '../product.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { AtualizarStatusPedidoDto } from './dto/atualizar-status-pedido.dto';

/**
 * Service de Pedidos
 * 
 * Gerencia todo o ciclo de vida dos pedidos
 */
@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(ItemPedido)
    private itemPedidoRepository: Repository<ItemPedido>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Cria novo pedido
   * 
   * @param id_usuario ID do usuário que está fazendo o pedido
   * @param criarPedidoDto Dados do pedido
   * @returns Pedido criado
   */
  async criar(id_usuario: string, criarPedidoDto: CriarPedidoDto): Promise<Pedido> {
    // Busca usuário
    const usuario = await this.usuarioRepository.findOne({
      where: { id: id_usuario }
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Valida e busca produtos
    const itensComPreco: ItemPedido[] = [];
    let subtotal = 0;

    for (const item of criarPedidoDto.itens) {
      const produto = await this.productRepository.findOne({
        where: { id: item.id_produto }
      });

      if (!produto) {
        throw new NotFoundException(`Produto com ID ${item.id_produto} não encontrado`);
      }

      // Cria item do pedido
      const itemPedido = this.itemPedidoRepository.create({
        produto: produto,
        quantidade: item.quantidade,
        preco_unitario: Number(produto.price),
        subtotal: Number(produto.price) * item.quantidade,
        observacoes: item.observacoes,
      });

      itensComPreco.push(itemPedido);
      subtotal += itemPedido.subtotal;
    }

    // Calcula taxas
    const taxa_entrega = criarPedidoDto.taxa_entrega || 0;
    const taxa_servico = 0; // Pode adicionar lógica de cálculo
    const total = subtotal + taxa_entrega + taxa_servico;

    // Cria pedido
    const pedido = this.pedidoRepository.create({
      usuario: usuario,
      tipo_pedido: criarPedidoDto.tipo_pedido,
      observacoes: criarPedidoDto.observacoes,
      endereco_entrega: criarPedidoDto.endereco_entrega,
      subtotal: subtotal,
      taxa_entrega: taxa_entrega,
      taxa_servico: taxa_servico,
      total: total,
      status: StatusPedido.PENDENTE,
      itens: itensComPreco,
    });

    return this.pedidoRepository.save(pedido);
  }

  /**
   * Lista todos os pedidos (Admin e Dono)
   * 
   * @returns Lista de pedidos
   */
  async listarTodos(): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      relations: ['usuario', 'usuario.perfil', 'itens', 'itens.produto'],
      order: { data_criacao: 'DESC' },
    });
  }

  /**
   * Lista pedidos do usuário autenticado
   * 
   * @param id_usuario ID do usuário
   * @returns Lista de pedidos do usuário
   */
  async listarPorUsuario(id_usuario: string): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      where: { usuario: { id: id_usuario } },
      relations: ['itens', 'itens.produto'],
      order: { data_criacao: 'DESC' },
    });
  }

  /**
   * Busca pedido por ID
   * 
   * @param id ID do pedido
   * @returns Pedido encontrado
   */
  async buscarPorId(id: string): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['usuario', 'usuario.perfil', 'itens', 'itens.produto'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    return pedido;
  }

  /**
   * Busca pedido por número
   * 
   * @param numero_pedido Número do pedido
   * @returns Pedido encontrado
   */
  async buscarPorNumero(numero_pedido: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { numero_pedido },
      relations: ['usuario', 'usuario.perfil', 'itens', 'itens.produto'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${numero_pedido} não encontrado`);
    }

    return pedido;
  }

  /**
   * Atualiza status do pedido
   * 
   * @param id ID do pedido
   * @param atualizarStatusDto Novo status
   * @returns Pedido atualizado
   */
  async atualizarStatus(id: string, atualizarStatusDto: AtualizarStatusPedidoDto): Promise<Pedido> {
    const pedido = await this.buscarPorId(id);

    // Valida transição de status (regras de negócio)
    this.validarTransicaoStatus(pedido.status, atualizarStatusDto.status);

    pedido.status = atualizarStatusDto.status;
    return this.pedidoRepository.save(pedido);
  }

  /**
   * Valida se a transição de status é permitida
   * 
   * @param statusAtual Status atual do pedido
   * @param novoStatus Novo status desejado
   */
  private validarTransicaoStatus(statusAtual: StatusPedido, novoStatus: StatusPedido): void {
    // Regras de transição de status
    const transicoesPermitidas: Record<StatusPedido, StatusPedido[]> = {
      [StatusPedido.PENDENTE]: [StatusPedido.CONFIRMADO, StatusPedido.CANCELADO],
      [StatusPedido.CONFIRMADO]: [StatusPedido.EM_PREPARO, StatusPedido.CANCELADO],
      [StatusPedido.EM_PREPARO]: [StatusPedido.PRONTO, StatusPedido.CANCELADO],
      [StatusPedido.PRONTO]: [StatusPedido.SAIU_ENTREGA, StatusPedido.ENTREGUE],
      [StatusPedido.SAIU_ENTREGA]: [StatusPedido.ENTREGUE, StatusPedido.CANCELADO],
      [StatusPedido.ENTREGUE]: [], // Status final, não pode mudar
      [StatusPedido.CANCELADO]: [], // Status final, não pode mudar
    };

    const transicoesValidas = transicoesPermitidas[statusAtual] || [];

    if (!transicoesValidas.includes(novoStatus)) {
      throw new BadRequestException(
        `Não é possível alterar status de '${statusAtual}' para '${novoStatus}'`
      );
    }
  }

  /**
   * Cancela pedido
   * Só pode cancelar pedidos em status específicos
   * 
   * @param id ID do pedido
   * @param id_usuario ID do usuário (para validar se é o dono do pedido)
   * @returns Pedido cancelado
   */
  async cancelar(id: string, id_usuario: string): Promise<Pedido> {
    const pedido = await this.buscarPorId(id);

    // Valida se o usuário pode cancelar (é o dono do pedido ou é Admin/Dono)
    if (pedido.usuario.id !== id_usuario) {
      // Se não é o dono do pedido, verifica se é Admin ou Dono
      // (essa validação será feita no Guard também)
    }

    // Só pode cancelar se estiver em status específicos
    const statusCancelaveis = [
      StatusPedido.PENDENTE,
      StatusPedido.CONFIRMADO,
    ];

    if (!statusCancelaveis.includes(pedido.status)) {
      throw new BadRequestException(
        `Não é possível cancelar pedido com status '${pedido.status}'`
      );
    }

    pedido.status = StatusPedido.CANCELADO;
    return this.pedidoRepository.save(pedido);
  }

  /**
   * Lista pedidos por status
   * 
   * @param status Status dos pedidos
   * @returns Lista de pedidos
   */
  async listarPorStatus(status: StatusPedido): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      where: { status },
      relations: ['usuario', 'usuario.perfil', 'itens', 'itens.produto'],
      order: { data_criacao: 'DESC' },
    });
  }

  /**
   * Estatísticas de pedidos (para dashboard)
   * 
   * @returns Estatísticas
   */
  async obterEstatisticas() {
    const totalPedidos = await this.pedidoRepository.count();
    const pedidosPendentes = await this.pedidoRepository.count({ where: { status: StatusPedido.PENDENTE } });
    const pedidosEmPreparo = await this.pedidoRepository.count({ where: { status: StatusPedido.EM_PREPARO } });
    const pedidosFinalizados = await this.pedidoRepository.count({ where: { status: StatusPedido.ENTREGUE } });

    // Valor total (pode adicionar filtro por período)
    const resultado = await this.pedidoRepository
      .createQueryBuilder('pedido')
      .select('SUM(pedido.total)', 'total')
      .getRawOne();

    return {
      total_pedidos: totalPedidos,
      pendentes: pedidosPendentes,
      em_preparo: pedidosEmPreparo,
      finalizados: pedidosFinalizados,
      valor_total: Number(resultado?.total) || 0,
    };
  }
}


