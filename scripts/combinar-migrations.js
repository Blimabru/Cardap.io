/**
 * Script para combinar todas as migrations em um único arquivo SQL
 * Facilita a execução manual no Supabase Dashboard
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const outputFile = path.join(__dirname, '..', 'supabase', 'migrations', 'TODAS_MIGRATIONS.sql');

const migrations = [
  '001_create_schema.sql',
  '002_create_rls_policies.sql',
];

let sqlCombinado = `-- ============================================================================
-- TODAS AS MIGRATIONS COMBINADAS
-- ============================================================================
-- 
-- Este arquivo contém todas as migrations necessárias para o sistema Cardap.io
-- Execute este arquivo COMPLETO no Supabase Dashboard > SQL Editor
-- 
-- IMPORTANTE:
-- - Execute tudo de uma vez (ou separe manualmente se preferir)
-- - Verifique se não houve erros
-- - Após executar, crie um usuário admin (veja MIGRACAO-SUPABASE.md)
-- 
-- ============================================================================

`;

migrations.forEach((arquivo, index) => {
  const caminhoCompleto = path.join(migrationsDir, arquivo);
  const conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
  
  sqlCombinado += `\n\n-- ============================================================================\n`;
  sqlCombinado += `-- MIGRATION ${index + 1}/${migrations.length}: ${arquivo}\n`;
  sqlCombinado += `-- ============================================================================\n\n`;
  sqlCombinado += conteudo;
  sqlCombinado += `\n\n-- ============================================================================\n`;
  sqlCombinado += `-- FIM DA MIGRATION ${index + 1}: ${arquivo}\n`;
  sqlCombinado += `-- ============================================================================\n`;
});

sqlCombinado += `\n\n-- ============================================================================\n`;
sqlCombinado += `-- FIM DE TODAS AS MIGRATIONS\n`;
sqlCombinado += `-- ============================================================================\n`;
sqlCombinado += `-- \n`;
sqlCombinado += `-- ✅ Todas as migrations foram executadas!\n`;
sqlCombinado += `-- \n`;
sqlCombinado += `-- PRÓXIMOS PASSOS:\n`;
sqlCombinado += `-- 1. Verifique se todas as tabelas foram criadas\n`;
sqlCombinado += `-- 2. Crie um usuário admin (veja MIGRACAO-SUPABASE.md)\n`;
sqlCombinado += `-- 3. Teste o sistema!\n`;
sqlCombinado += `-- \n`;
sqlCombinado += `-- ============================================================================\n`;

fs.writeFileSync(outputFile, sqlCombinado, 'utf8');

console.log('✅ Arquivo combinado criado com sucesso!');
console.log(`📄 Localização: ${outputFile}`);
console.log('\n📋 INSTRUÇÕES:');
console.log('1. Acesse: https://supabase.com/dashboard');
console.log('2. Selecione seu projeto');
console.log('3. Vá em: SQL Editor');
console.log('4. Abra o arquivo: supabase/migrations/TODAS_MIGRATIONS.sql');
console.log('5. Cole todo o conteúdo no editor');
console.log('6. Clique em "Run" (ou pressione Ctrl+Enter)');
console.log('7. Verifique se não houve erros\n');


