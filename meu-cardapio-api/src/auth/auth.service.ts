import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Perfil } from '../perfis/entities/perfil.entity';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';

/**
 * Service de Autenticação
 * 
 * Gerencia login, registro e geração de tokens JWT
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Perfil)
    private perfilRepository: Repository<Perfil>,
    private jwtService: JwtService,
  ) {}

  /**
   * Realiza login de usuário
   * 
   * @param loginDto Dados de login (email e senha)
   * @returns Token JWT e dados do usuário
   */
  async login(loginDto: LoginDto) {
    // Busca usuário com senha (select: false por padrão)
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.senha_hash')
      .leftJoinAndSelect('usuario.perfil', 'perfil')
      .where('usuario.email = :email', { email: loginDto.email })
      .getOne();

    // Verifica se usuário existe
    if (!usuario) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Verifica se usuário está ativo
    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário desativado. Entre em contato com o administrador.');
    }

    // Valida senha
    const senhaValida = await usuario.validarSenha(loginDto.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Gera token JWT
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil.nome_perfil,
      id_perfil: usuario.perfil.id,
    };

    const token = this.jwtService.sign(payload);

    // Remove senha do retorno
    const { senha_hash, ...usuarioSemSenha } = usuario;

    return {
      usuario: usuarioSemSenha as Usuario,
      token,
      tipo_token: 'Bearer',
    };
  }

  /**
   * Registra novo usuário (como Cliente)
   * 
   * @param registroDto Dados do novo usuário
   * @returns Token JWT e dados do usuário criado
   */
  async registro(registroDto: RegistroDto) {
    // Verifica se email já existe
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { email: registroDto.email }
    });

    if (usuarioExistente) {
      throw new ConflictException('Email já cadastrado no sistema');
    }

    // Busca perfil "Cliente" (será criado nas seeds)
    const perfilCliente = await this.perfilRepository.findOne({
      where: { nome_perfil: 'Cliente' }
    });

    if (!perfilCliente) {
      throw new Error('Perfil Cliente não encontrado. Execute as seeds do banco de dados.');
    }

    // Cria novo usuário
    const novoUsuario = this.usuarioRepository.create({
      nome_completo: registroDto.nome_completo,
      email: registroDto.email,
      senha_hash: registroDto.senha, // Será criptografada pelo @BeforeInsert
      telefone: registroDto.telefone,
      foto_perfil_url: registroDto.foto_perfil_url,
      perfil: perfilCliente,
      ativo: true,
      email_verificado: false,
    });

    const usuarioSalvo = await this.usuarioRepository.save(novoUsuario);

    // Faz login automático após registro
    return this.login({
      email: registroDto.email,
      senha: registroDto.senha,
    });
  }

  /**
   * Valida e retorna dados do usuário a partir do token
   * 
   * @param id_usuario ID do usuário no token
   * @returns Dados do usuário
   */
  async validarUsuario(id_usuario: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: id_usuario },
      relations: ['perfil'],
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário inválido ou desativado');
    }

    return usuario;
  }
}


