import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perfil } from './entities/perfil.entity';
import { PerfisController } from './perfis.controller';

/**
 * Módulo de Perfis
 * 
 * Gerencia perfis de usuário (Admin, Dono, Cliente)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Perfil])],
  controllers: [PerfisController],
  exports: [TypeOrmModule],
})
export class PerfisModule {}


