/**
 * Script para executar migrations SQL no Supabase
 * 
 * Tenta múltiplos formatos de connection string
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Tentar diferentes formatos de connection string
const CONNECTION_STRINGS = [
  // Formato 1: Direto (mais comum)
  'postgresql://postgres:deusdaguerra1@db.cxisgfykkemcbqymtses.supabase.co:5432/postgres',
  
  // Formato 2: Com usuário completo
  'postgresql://postgres.cxisgfykkemcbqymtses:deusdaguerra1@db.cxisgfykkemcbqymtses.supabase.co:5432/postgres',
  
  // Formato 3: Pooler (porta 6543)
  'postgresql://postgres.cxisgfykkemcbqymtses:deusdaguerra1@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  
  // Formato 4: Pooler sem pgbouncer
  'postgresql://postgres.cxisgfykkemcbqymtses:deusdaguerra1@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
];

async function executarSQL(arquivo, connectionString) {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    const sql = fs.readFileSync(arquivo, 'utf8');
    await client.query(sql);
    return true;
  } catch (error) {
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  EXECUTANDO MIGRATIONS NO SUPABASE');
  console.log('═══════════════════════════════════════════════════════════\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrations = [
    path.join(migrationsDir, '001_create_schema.sql'),
    path.join(migrationsDir, '002_create_rls_policies.sql'),
  ];

  let connectionStringFuncionou = null;

  // Tentar cada formato de connection string
  for (let i = 0; i < CONNECTION_STRINGS.length; i++) {
    const connStr = CONNECTION_STRINGS[i];
    console.log(`\n🔄 Tentando connection string ${i + 1}/${CONNECTION_STRINGS.length}...`);
    
    try {
      const client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false }
      });
      
      await client.connect();
      console.log('✅ Conexão estabelecida!');
      await client.end();
      connectionStringFuncionou = connStr;
      break;
    } catch (error) {
      console.log(`❌ Falhou: ${error.message}`);
      continue;
    }
  }

  if (!connectionStringFuncionou) {
    console.log('\n❌ Nenhuma connection string funcionou!');
    console.log('\n📋 INSTRUÇÕES MANUAIS:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto: cxisgfykkemcbqymtses');
    console.log('3. Vá em: Settings > Database');
    console.log('4. Em "Connection string", copie a string "URI" (não pooling)');
    console.log('5. Substitua [YOUR-PASSWORD] por: deusdaguerra1');
    console.log('6. Execute os SQLs manualmente no SQL Editor\n');
    console.log('Arquivos SQL:');
    migrations.forEach((m, i) => {
      console.log(`   ${i + 1}. ${path.basename(m)}`);
    });
    process.exit(1);
  }

  console.log(`\n✅ Usando connection string: ${connectionStringFuncionou.substring(0, 50)}...`);

  // Executar migrations
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    const nomeArquivo = path.basename(migration);
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  MIGRATION ${i + 1}/${migrations.length}: ${nomeArquivo}`);
    console.log(`${'═'.repeat(60)}`);
    
    try {
      await executarSQL(migration, connectionStringFuncionou);
      console.log(`✅ Migration ${i + 1} concluída com sucesso!`);
    } catch (error) {
      console.error(`\n❌ Erro na migration ${i + 1}:`);
      console.error(`   ${error.message}`);
      console.error('\n🛑 Parando execução...');
      process.exit(1);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ TODAS AS MIGRATIONS FORAM EXECUTADAS COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  process.exit(1);
});


