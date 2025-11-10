import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Perfil } from '../perfis/entities/perfil.entity';

/**
 * Módulo de Autenticação
 * 
 * Gerencia login, registro e validação JWT
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Perfil]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cardapio_jwt_secret_2025_super_seguro',
      signOptions: { 
        expiresIn: '7d'
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}


