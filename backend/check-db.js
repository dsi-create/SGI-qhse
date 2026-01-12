// Quick database connection and table check script
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available, use defaults
}
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: process.env.DB_PORT || 3306,
};

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${dbConfig.host}`);
  console.log(`  User: ${dbConfig.user}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log(`  Port: ${dbConfig.port}\n`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!\n');

    // Check if incidents table exists
    const [tables] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'incidents'",
      [dbConfig.database]
    );

    if (tables[0].count === 0) {
      console.log('❌ Table "incidents" does NOT exist!');
      console.log('💡 Please run database/schema.sql to create the table\n');
    } else {
      console.log('✅ Table "incidents" exists\n');

      // Check table structure
      const [columns] = await connection.execute(
        "SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS WHERE table_schema = ? AND table_name = 'incidents' ORDER BY ORDINAL_POSITION",
        [dbConfig.database]
      );

      console.log('Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
      });
      console.log('');

      // Try to query the table
      try {
        const [incidents] = await connection.execute('SELECT COUNT(*) as count FROM incidents');
        console.log(`✅ Query successful! Found ${incidents[0].count} incident(s) in the table\n`);
      } catch (queryError) {
        console.log('❌ Error querying incidents table:');
        console.error('  Message:', queryError.message);
        console.error('  Code:', queryError.code);
        console.error('  SQL State:', queryError.sqlState);
        console.error('  SQL Message:', queryError.sqlMessage);
      }
    }

    await connection.end();
    console.log('✅ All checks completed!');
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('  Error:', error.message);
    console.error('  Code:', error.code);
    console.error('\n💡 Possible issues:');
    console.error('  1. MySQL server is not running');
    console.error('  2. Wrong database credentials in backend/.env');
    console.error('  3. Database "hospital_management" does not exist');
    console.error('  4. User does not have access to the database\n');
    process.exit(1);
  }
}

checkDatabase();

