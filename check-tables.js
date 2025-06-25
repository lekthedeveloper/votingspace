const { Client } = require('pg');

async function checkTables() {
  const connectionString = "postgresql://votingapp_vmfd_user:W5mAVbA3DVdTsvm79gitczQTHPGVnwsj@dpg-d1c0qph5pdvs73ebeccg-a.oregon-postgres.render.com/votingapp_vmfd";
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔍 Checking existing tables...');
    
    // Get all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check for enums
    const enumResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname;
    `);
    
    console.log('\n🏷️ Existing enums:');
    enumResult.rows.forEach(row => {
      console.log(`  - ${row.typname}`);
    });
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTables();