import { hash, compare } from 'bcryptjs';

import db from '../db.js';

import { isBlocked, registerAttempt, resetAttempts } from './bruteForceProtection.js';

async function register({ firstName, lastName, email, password }) {
  const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedPassword = await hash(password, 10);

  try {
    await db.query(`
      INSERT INTO users (first_name, last_name, email, password, confirmation_code)
      VALUES ($1, $2, $3, $4, $5)
    `, [firstName, lastName, email, hashedPassword, confirmationCode]);
    return confirmationCode;
  } catch (err) {
    if (err.code === '23505') {
      return null; // email уже существует
    } else {
      throw err;
    }
  }
}

async function login(email, password, ip) {
  if (isBlocked(ip)) {
    return 'blocked';
  }

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    registerAttempt(ip);
    return false;
  }

  const match = await compare(password, user.password);
  if (!match) {
    registerAttempt(ip);
    return false;
  }

  // теперь проверяем подтверждение ТОЛЬКО если пароль верный
  if (!user.is_confirmed) return 'not-confirmed';

  resetAttempts(ip);
  return user;
}

async function confirm(email, code) {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1 AND confirmation_code = $2',
    [email, code]
  );

  if (result.rows.length === 0) return false;

  await db.query(
    'UPDATE users SET is_confirmed = TRUE WHERE email = $1',
    [email]
  );

  return true;
}

export default { register, login, confirm };