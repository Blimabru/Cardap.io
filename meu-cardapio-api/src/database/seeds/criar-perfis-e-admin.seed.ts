import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Perfil } from '../../perfis/entities/perfil.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

/**
 * Seed para criar perfis padrão e usuário administrador
 * 
 * Execute: npm run seed
 */
export async function criarPerfisEAdmin(dataSource: DataSource) {
  const perfilRepository = dataSource.getRepository(Perfil);
  const usuarioRepository = dataSource.getRepository(Usuario);

  console.log('🌱 Iniciando seed de perfis e usuário admin...\n');

  // ============================================
  // 1. CRIAR PERFIS
  // ============================================

  // Perfil: Administrador
  let perfilAdmin = await perfilRepository.findOne({ 
    where: { nome_perfil: 'Administrador' } 
  });

  if (!perfilAdmin) {
    perfilAdmin = perfilRepository.create({
      nome_perfil: 'Administrador',
      descricao: 'Controle total do sistema. Pode gerenciar usuários, perfis, produtos, categorias e pedidos.',
      permissoes: {
        paginas: {
          dashboard: { acessar: true, visualizar: true, editar: true, deletar: true },
          produtos: { acessar: true, visualizar: true, editar: true, deletar: true },
          categorias: { acessar: true, visualizar: true, editar: true, deletar: true },
          pedidos: { acessar: true, visualizar: true, editar: true, deletar: true },
          usuarios: { acessar: true, visualizar: true, editar: true, deletar: true },
          relatorios: { acessar: true, visualizar: true, editar: false, deletar: false },
        },
        funcionalidades: {
          criar_produto: true,
          editar_produto: true,
          deletar_produto: true,
          criar_categoria: true,
          editar_categoria: true,
          deletar_categoria: true,
          criar_usuario: true,
          editar_usuario: true,
          deletar_usuario: true,
          ver_todos_pedidos: true,
          editar_pedido: true,
          cancelar_pedido: true,
          gerar_relatorio: true,
          alterar_configuracoes: true,
        },
      },
      ativo: true,
    });
    await perfilRepository.save(perfilAdmin);
    console.log('✅ Perfil "Administrador" criado');
  } else {
    console.log('ℹ️  Perfil "Administrador" já existe');
  }

  // Perfil: Dono
  let perfilDono = await perfilRepository.findOne({ 
    where: { nome_perfil: 'Dono' } 
  });

  if (!perfilDono) {
    perfilDono = perfilRepository.create({
      nome_perfil: 'Dono',
      descricao: 'Proprietário do estabelecimento. Gerencia cardápio, pedidos e visualiza relatórios.',
      permissoes: {
        paginas: {
          dashboard: { acessar: true, visualizar: true, editar: false, deletar: false },
          produtos: { acessar: true, visualizar: true, editar: true, deletar: true },
          categorias: { acessar: true, visualizar: true, editar: true, deletar: true },
          pedidos: { acessar: true, visualizar: true, editar: true, deletar: false },
          usuarios: { acessar: true, visualizar: true, editar: false, deletar: false },
          relatorios: { acessar: true, visualizar: true, editar: false, deletar: false },
        },
        funcionalidades: {
          criar_produto: true,
          editar_produto: true,
          deletar_produto: true,
          criar_categoria: true,
          editar_categoria: true,
          deletar_categoria: true,
          criar_usuario: false,
          editar_usuario: false,
          deletar_usuario: false,
          ver_todos_pedidos: true,
          editar_pedido: true,
          cancelar_pedido: true,
          gerar_relatorio: true,
          alterar_configuracoes: false,
        },
      },
      ativo: true,
    });
    await perfilRepository.save(perfilDono);
    console.log('✅ Perfil "Dono" criado');
  } else {
    console.log('ℹ️  Perfil "Dono" já existe');
  }

  // Perfil: Cliente
  let perfilCliente = await perfilRepository.findOne({ 
    where: { nome_perfil: 'Cliente' } 
  });

  if (!perfilCliente) {
    perfilCliente = perfilRepository.create({
      nome_perfil: 'Cliente',
      descricao: 'Cliente do estabelecimento. Pode visualizar cardápio e fazer pedidos.',
      permissoes: {
        paginas: {
          cardapio: { acessar: true, visualizar: true, editar: false, deletar: false },
          meus_pedidos: { acessar: true, visualizar: true, editar: false, deletar: false },
          perfil: { acessar: true, visualizar: true, editar: true, deletar: false },
        },
        funcionalidades: {
          ver_cardapio: true,
          fazer_pedido: true,
          cancelar_proprio_pedido: true,
          ver_historico: true,
          editar_perfil: true,
        },
      },
      ativo: true,
    });
    await perfilRepository.save(perfilCliente);
    console.log('✅ Perfil "Cliente" criado');
  } else {
    console.log('ℹ️  Perfil "Cliente" já existe');
  }

  // ============================================
  // 2. CRIAR USUÁRIO ADMINISTRADOR
  // ============================================

  const emailAdmin = 'admin@cardapio.com';
  let usuarioAdmin = await usuarioRepository.findOne({ 
    where: { email: emailAdmin } 
  });

  if (!usuarioAdmin) {
    // Criptografa senha
    const senhaAdmin = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senhaAdmin, salt);

    usuarioAdmin = usuarioRepository.create({
      nome_completo: 'Administrador do Sistema',
      email: emailAdmin,
      senha_hash: senhaHash,
      telefone: '(11) 99999-9999',
      perfil: perfilAdmin,
      ativo: true,
      email_verificado: true,
    });

    await usuarioRepository.save(usuarioAdmin);
    
    console.log('\n✅ Usuário Administrador criado com sucesso!');
    console.log('📧 Email: admin@cardapio.com');
    console.log('🔑 Senha: admin123');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');
  } else {
    console.log('\nℹ️  Usuário Administrador já existe');
    console.log('📧 Email: admin@cardapio.com\n');
  }

  console.log('✅ Seed concluído com sucesso!\n');
}


