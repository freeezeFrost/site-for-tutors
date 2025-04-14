import db from '../db.js';

(async () => {
  try {
    const now = new Date();
    const result = await db.query(
      'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE reset_token_expires < $1',
      [now]
    );
    console.log(`Удалено просроченных токенов: ${result.rowCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при очистке токенов:', error);
    process.exit(1);
  }
})();
