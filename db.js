import pkg from 'pg';
const { Pool } = pkg;

  const pool = new Pool({
  user: 'tutors_user',
  host: 'localhost',
  database: 'sitefortutors',
  password: 'FokinVlad15',
  port: 5432,
});  // ЭТО ДЛЯ ВДС БАЗЫ


/*  const pool = new Pool({
  database: 'sitefortutors',
  user: 'main',
  password: '', // если не настраивал пароль
  host: 'localhost',
  port: 5432,
}); */ //ЭТО ДЛЯ БАЗЫ НА ЛОКАЛКЕ

const db = pool;
export default db;



