import pool from './db.js';

async function deleteUnconfirmedUsers() {
  try {
    const result = await pool.query(`
      DELETE FROM users
      WHERE is_confirmed = false
        AND created_at < NOW() - INTERVAL '5 minutes'
    `);
    console.log(`Удалено неподтверждённых пользователей: ${result.rowCount}`);
  } catch (err) {
    console.error('Ошибка при удалении:', err);
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  deleteUnconfirmedUsers();
}
