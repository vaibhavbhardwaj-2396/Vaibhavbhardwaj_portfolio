import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to execute queries
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to handle database errors
export const handleDatabaseError = (error: any): string => {
  console.error('Database error:', error);
  
  if (error.code === 'ECONNREFUSED') {
    return 'Unable to connect to database. Please try again later.';
  }
  
  if (error.code === 'ER_DUP_ENTRY') {
    return 'This record already exists.';
  }
  
  return 'An unexpected database error occurred. Please try again later.';
};

// Check database connection
export const checkDatabaseConnection = async () => {
  try {
    await pool.getConnection();
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};