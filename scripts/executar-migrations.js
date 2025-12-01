/**
 * Script para executar migrations SQL no Supabase
 * 
 * Executa os arquivos SQL diretamente no banco de dados Supabase
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string do Supabase
// Formato direto (sem pooler): postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
// Formato pooler: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// Tentando formato direto primeiro
const CONNECTION_STRING = 'postgresql://postgres:deusdaguerra1@db.cxisgfykkemcbqymtses.supabase.co:5432/postgres';

async function executarSQL(arquivo) {
  const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log(`\n🔄 Conectando ao Supabase...`);
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    console.log(`\n📄 Lendo arquivo: ${arquivo}`);
    const sql = fs.readFileSync(arquivo, 'utf8');
    
    console.log(`\n⚡ Executando SQL...`);
    await client.query(sql);
    
    console.log(`✅ SQL executado com sucesso!`);
  } catch (error) {
    console.error(`\n❌ Erro ao executar SQL:`);
    console.error(error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada.\n');
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  EXECUTANDO MIGRATIONS NO SUPABASE');
  console.log('═══════════════════════════════════════════════════════════');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  const migrations = [
    path.join(migrationsDir, '001_create_schema.sql'),
    path.join(migrationsDir, '002_create_rls_policies.sql'),
  ];

  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    const nomeArquivo = path.basename(migration);
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  MIGRATION ${i + 1}/${migrations.length}: ${nomeArquivo}`);
    console.log(`${'═'.repeat(60)}`);
    
    try {
      await executarSQL(migration);
      console.log(`✅ Migration ${i + 1} concluída com sucesso!`);
    } catch (error) {
      console.error(`\n❌ FALHA na migration ${i + 1}: ${nomeArquivo}`);
      console.error('🛑 Parando execução...');
      process.exit(1);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ TODAS AS MIGRATIONS FORAM EXECUTADAS COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Verifique no Supabase Dashboard se as tabelas foram criadas');
  console.log('2. Crie um usuário admin (veja MIGRACAO-SUPABASE.md)');
  console.log('3. Teste o sistema!\n');
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});

