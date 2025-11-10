import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perfil } from './entities/perfil.entity';

/**
 * Módulo de Perfis
 * 
 * Gerencia perfis de usuário (Admin, Dono, Cliente)
 * Não tem controller pois perfis serão gerenciados via seeds
 */
@Module({
  imports: [TypeOrmModule.forFeature([Perfil])],
  exports: [TypeOrmModule],
})
export class PerfisModule {}


