import { DataSource } from 'typeorm';
import { configuracaoBancoDados } from '../../config/database.config';
import { criarPerfisEAdmin } from './criar-perfis-e-admin.seed';

/**
 * Script principal de seeds
 * 
 * Execute: npm run seed
 */
async function executarSeeds() {
  // Carrega variáveis de ambiente
  require('dotenv').config();

  console.log('🌱 Iniciando seeds do banco de dados...\n');

  // Cria conexão com o banco
  const dataSource = new DataSource({
    ...(configuracaoBancoDados() as any),
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conexão com banco de dados estabelecida\n');

    // Executa seeds
    await criarPerfisEAdmin(dataSource);

    console.log('🎉 Todos os seeds foram executados com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Executa seeds
executarSeeds();


