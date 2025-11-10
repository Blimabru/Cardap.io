import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { Perfil } from '../perfis/entities/perfil.entity';

/**
 * Módulo de Usuários
 * 
 * Gerencia CRUD de usuários (apenas Admin)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Perfil])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}


