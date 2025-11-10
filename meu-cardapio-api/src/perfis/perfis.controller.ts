/**
 * ============================================================================
 * PERFIS.CONTROLLER.TS - CONTROLLER DE PERFIS
 * ============================================================================
 * 
 * Controller simples para listar perfis disponíveis no sistema.
 * 
 * PERFIS DO SISTEMA:
 * 1. Administrador - Acesso total ao sistema
 * 2. Dono - Gestão de produtos, categorias e pedidos
 * 3. Cliente - Fazer pedidos e ver histórico
 * 
 * USO PRINCIPAL:
 * - Tela de criação/edição de usuários
 * - Admin precisa selecionar um perfil ao criar usuário
 * - Frontend busca lista de perfis desta rota
 * 
 * NOTA:
 * - Perfis são criados via seed (não há CRUD de perfis)
 * - São fixos no sistema
 * - Apenas leitura permitida
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perfil } from './entities/perfil.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';

/**
 * Controller de Perfis
 * 
 * Controller muito simples: apenas lista perfis.
 * Não há CREATE, UPDATE ou DELETE de perfis.
 */
@Controller('perfis')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class PerfisController {
  /**
   * Injeta diretamente o Repository de Perfil
   * 
   * Não precisa de Service pois a lógica é extremamente simples.
   * Apenas busca perfis ativos do banco.
   * 
   * @InjectRepository(Perfil) - Injeta repository do TypeORM
   */
  constructor(
    @InjectRepository(Perfil)
    private perfilRepository: Repository<Perfil>,
  ) {}

  /**
   * ========================================================================
   * GET /perfis
   * ========================================================================
   * 
   * LISTA TODOS OS PERFIS ATIVOS
   * 
   * PERMISSÕES: Administrador e Dono
   * 
   * RESPONSE:
   * [
   *   {
   *     "id": "uuid-1",
   *     "nome_perfil": "Administrador",
   *     "ativo": true,
   *     "criado_em": "2025-11-10T...",
   *     "atualizado_em": "2025-11-10T..."
   *   },
   *   {
   *     "id": "uuid-2",
   *     "nome_perfil": "Dono",
   *     "ativo": true,
   *     "criado_em": "2025-11-10T...",
   *     "atualizado_em": "2025-11-10T..."
   *   },
   *   {
   *     "id": "uuid-3",
   *     "nome_perfil": "Cliente",
   *     "ativo": true,
   *     "criado_em": "2025-11-10T...",
   *     "atualizado_em": "2025-11-10T..."
   *   }
   * ]
   * 
   * COMPORTAMENTO:
   * - Retorna apenas perfis com ativo = true
   * - Ordenado por nome_perfil (alfabético)
   * - Geralmente retorna 3 perfis (Admin, Dono, Cliente)
   * 
   * USO NO FRONTEND:
   * - Tela de criar/editar usuário (app/admin/usuarios.tsx)
   * - Chips de seleção de perfil
   * - Frontend chama esta rota ao abrir a tela
   * - Armazena lista de perfis em estado local
   * - Exibe como opções de seleção
   * 
   * EXEMPLO DE USO NO FRONTEND:
   * ```typescript
   * const [perfis, setPerfis] = useState([]);
   * 
   * useEffect(() => {
   *   async function carregarPerfis() {
   *     const response = await perfisService.listarTodos();
   *     setPerfis(response);
   *   }
   *   carregarPerfis();
   * }, []);
   * 
   * // Exibir chips:
   * perfis.map(perfil => (
   *   <TouchableOpacity onPress={() => setPerfilSelecionado(perfil.nome_perfil)}>
   *     <Text>{perfil.nome_perfil}</Text>
   *   </TouchableOpacity>
   * ))
   * ```
   */
  @Get()
  @Perfis('Administrador', 'Dono')
  async listarTodos(): Promise<Perfil[]> {
    // Busca perfis do banco com filtros e ordenação
    return this.perfilRepository.find({
      where: { ativo: true },           // Apenas perfis ativos
      order: { nome_perfil: 'ASC' },    // Ordenação alfabética
    });
  }
}

/**
 * ============================================================================
 * POR QUE NÃO HÁ CRUD DE PERFIS?
 * ============================================================================
 * 
 * Perfis são parte FUNDAMENTAL da arquitetura de segurança do sistema.
 * 
 * RAZÕES:
 * 1. SEGURANÇA:
 *    - Criar perfis via interface pode criar brechas de segurança
 *    - Perfis mal configurados podem dar acesso indevido
 * 
 * 2. ESTABILIDADE:
 *    - Sistema depende dos 3 perfis específicos
 *    - Código valida perfis pelo nome exato ("Administrador", "Dono", "Cliente")
 *    - Criar perfis arbitrários quebraria a lógica
 * 
 * 3. SIMPLICIDADE:
 *    - Sistema pequeno não precisa de perfis dinâmicos
 *    - 3 perfis fixos atendem 99% dos casos
 * 
 * COMO ADICIONAR NOVO PERFIL (se realmente necessário):
 * 1. Criar migration para adicionar perfil no banco
 * 2. Atualizar guards para reconhecer novo perfil
 * 3. Atualizar todos os @Perfis() decorators relevantes
 * 4. Testar todas as rotas com novo perfil
 * 
 * MELHOR ABORDAGEM:
 * - Usar os 3 perfis existentes
 * - Se precisar mais granularidade, implementar sistema de permissões
 *   dentro de cada perfil (ex: Dono com permissão de X mas não Y)
 */
