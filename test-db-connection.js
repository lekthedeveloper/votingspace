const { Client } = require('pg');

async function testRenderConnection() {
  console.log('🔍 Testing Render PostgreSQL connection...');
  
  const connectionString = "postgresql://votingapp_vmfd_user:W5mAVbA3DVdTsvm79gitczQTHPGVnwsj@dpg-d1c0qph5pdvs73ebeccg-a.oregon-postgres.render.com/votingapp_vmfd";
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Render PostgreSQL connection successful!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 Database version:', result.rows[0].version.substring(0, 60) + '...');
    
    // Test creating a simple table
    await client.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table creation test successful!');
    
    // Clean up test table
    await client.query('DROP TABLE IF EXISTS connection_test');
    console.log('🧹 Cleanup completed');
    
    await client.end();
    console.log('🎉 Render database is ready for Prisma migrations!');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
}

testRenderConnection();