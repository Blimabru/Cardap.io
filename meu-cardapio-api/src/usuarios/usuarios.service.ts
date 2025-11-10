import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Perfil } from '../perfis/entities/perfil.entity';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';

/**
 * Service de Usuários
 * 
 * Gerencia CRUD completo de usuários (apenas Admin tem acesso)
 */
@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Perfil)
    private perfilRepository: Repository<Perfil>,
  ) {}

  /**
   * Cria novo usuário (Admin)
   * 
   * @param criarUsuarioDto Dados do novo usuário
   * @returns Usuário criado
   */
  async criar(criarUsuarioDto: CriarUsuarioDto): Promise<Usuario> {
    // Verifica se email já existe
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { email: criarUsuarioDto.email }
    });

    if (usuarioExistente) {
      throw new ConflictException('Email já cadastrado no sistema');
    }

    // Busca perfil
    const perfil = await this.perfilRepository.findOne({
      where: { id: criarUsuarioDto.id_perfil }
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${criarUsuarioDto.id_perfil} não encontrado`);
    }

    // Cria usuário
    const novoUsuario = this.usuarioRepository.create({
      nome_completo: criarUsuarioDto.nome_completo,
      email: criarUsuarioDto.email,
      senha_hash: criarUsuarioDto.senha, // Será criptografada pelo @BeforeInsert
      telefone: criarUsuarioDto.telefone,
      foto_perfil_url: criarUsuarioDto.foto_perfil_url,
      perfil: perfil,
      ativo: criarUsuarioDto.ativo !== undefined ? criarUsuarioDto.ativo : true,
      email_verificado: false,
    });

    return this.usuarioRepository.save(novoUsuario);
  }

  /**
   * Lista todos os usuários
   * 
   * @returns Lista de usuários
   */
  async listarTodos(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      relations: ['perfil'],
      order: { data_criacao: 'DESC' },
    });
  }

  /**
   * Busca usuário por ID
   * 
   * @param id ID do usuário
   * @returns Usuário encontrado
   */
  async buscarPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['perfil'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return usuario;
  }

  /**
   * Busca usuário por email
   * 
   * @param email Email do usuário
   * @returns Usuário encontrado
   */
  async buscarPorEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      relations: ['perfil'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com email ${email} não encontrado`);
    }

    return usuario;
  }

  /**
   * Atualiza dados do usuário
   * 
   * @param id ID do usuário
   * @param atualizarUsuarioDto Dados a atualizar
   * @returns Usuário atualizado
   */
  async atualizar(id: string, atualizarUsuarioDto: AtualizarUsuarioDto): Promise<Usuario> {
    const usuario = await this.buscarPorId(id);

    // Se está alterando email, verifica se não existe outro usuário com esse email
    if (atualizarUsuarioDto.email && atualizarUsuarioDto.email !== usuario.email) {
      const emailExistente = await this.usuarioRepository.findOne({
        where: { email: atualizarUsuarioDto.email }
      });

      if (emailExistente) {
        throw new ConflictException('Email já cadastrado no sistema');
      }
    }

    // Se está alterando perfil, busca o novo perfil
    if (atualizarUsuarioDto.id_perfil) {
      const perfil = await this.perfilRepository.findOne({
        where: { id: atualizarUsuarioDto.id_perfil }
      });

      if (!perfil) {
        throw new NotFoundException(`Perfil com ID ${atualizarUsuarioDto.id_perfil} não encontrado`);
      }

      usuario.perfil = perfil;
    }

    // Atualiza campos
    if (atualizarUsuarioDto.nome_completo) usuario.nome_completo = atualizarUsuarioDto.nome_completo;
    if (atualizarUsuarioDto.email) usuario.email = atualizarUsuarioDto.email;
    if (atualizarUsuarioDto.telefone) usuario.telefone = atualizarUsuarioDto.telefone;
    if (atualizarUsuarioDto.foto_perfil_url) usuario.foto_perfil_url = atualizarUsuarioDto.foto_perfil_url;
    if (atualizarUsuarioDto.ativo !== undefined) usuario.ativo = atualizarUsuarioDto.ativo;
    
    // Se forneceu nova senha, atualiza
    if (atualizarUsuarioDto.nova_senha) {
      usuario.senha_hash = atualizarUsuarioDto.nova_senha; // Será criptografada pelo @BeforeUpdate
    }

    return this.usuarioRepository.save(usuario);
  }

  /**
   * Desativa usuário (soft delete)
   * Não deleta do banco, apenas marca como inativo
   * 
   * @param id ID do usuário
   */
  async desativar(id: string): Promise<void> {
    const usuario = await this.buscarPorId(id);

    // Não permite desativar o próprio Admin principal (pode adicionar lógica adicional)
    // Por exemplo: verificar se é o único admin ativo

    usuario.ativo = false;
    await this.usuarioRepository.save(usuario);
  }

  /**
   * Reativa usuário
   * 
   * @param id ID do usuário
   */
  async reativar(id: string): Promise<void> {
    const usuario = await this.buscarPorId(id);
    usuario.ativo = true;
    await this.usuarioRepository.save(usuario);
  }

  /**
   * Deleta usuário permanentemente (usar com cuidado!)
   * Apenas Admin tem permissão
   * 
   * @param id ID do usuário
   */
  async deletar(id: string): Promise<void> {
    const usuario = await this.buscarPorId(id);
    
    // Não permite deletar usuário com pedidos (regra de negócio)
    // Para deletar, primeiro deve desativar e transferir/cancelar pedidos

    await this.usuarioRepository.remove(usuario);
  }

  /**
   * Lista usuários por perfil
   * 
   * @param nome_perfil Nome do perfil (Admin, Dono, Cliente)
   * @returns Lista de usuários do perfil
   */
  async listarPorPerfil(nome_perfil: string): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      where: { perfil: { nome_perfil } },
      relations: ['perfil'],
      order: { data_criacao: 'DESC' },
    });
  }
}


