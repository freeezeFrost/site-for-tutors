// scripts/deleteUnconfirmedUsers.js
import db from '../db.js';

const deleteUnconfirmedUsers = async () => {
  try {
    const result = await db.query(
      `DELETE FROM users 
       WHERE confirmed = false 
       AND created_at < NOW() - INTERVAL '5 minutes'`
    );

    console.log(`🗑️ Удалено неподтверждённых пользователей: ${result.rowCount}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при удалении неподтверждённых пользователей:', err);
    process.exit(1);
  }
};

deleteUnconfirmedUsers();
