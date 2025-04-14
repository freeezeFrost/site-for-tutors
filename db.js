import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  database: 'sitefortutors',
  user: 'main',
  password: '', // если не настраивал пароль
  host: 'localhost',
  port: 5432,
});

const db = pool;
export default db;



