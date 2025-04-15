import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import db from '../db.js';
import { sendConfirmationEmail, sendResetPasswordEmail } from './mailer.js';
import auth from './auth.js';
const { register, login, confirm } = auth;


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, phone } = req.body;

  if (password !== confirmPassword) {
    return res.send('Пароли не совпадают. <a href="/register.html">Назад</a>');
  }

  const tempDomains = ['10minutemail.com', 'yopmail.com', 'mailinator.com', 'guerrillamail.com', 'temp-mail.org', 'tempmail.lol'];
  const emailDomain = email.split('@')[1];
  if (tempDomains.includes(emailDomain)) {
    return res.send('Пожалуйста, используйте реальный email. Временные почтовые сервисы запрещены.');
  }

  const code = await register({ firstName, lastName, email, password, phone });

  if (!code) {
    return res.status(409).json({ error: 'Пользователь с такой почтой уже существует' });
  }  

try {
  await sendConfirmationEmail(email, code);
  console.log("Код подтверждения отправлен");
  res.redirect(`/confirm.html?email=${encodeURIComponent(email)}`);
} catch (err) {
  console.error('Ошибка при отправке письма:', err);
  res.send('Не удалось завершить регистрацию. Попробуйте позже.');
}

});


app.post('/confirm', async (req, res) => {
  const { email, code } = req.body;

  const success = await confirm(email, code);

  if (!success) {
    return res.redirect(`/confirm.html?email=${encodeURIComponent(email)}&status=error`);
  }

  return res.redirect('/confirm.html?status=success');
});



app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const result = await login(email, password, ip);

  if (result === 'not-confirmed') {
    return res.redirect(`/not-confirmed.html?email=${encodeURIComponent(email)}`);
  }
  if (result === 'blocked') return res.redirect('/login.html?blocked=true');
  if (result) return res.redirect('/dashboard.html');
  return res.redirect('/login.html?error=true');
});


// GET /login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// GET /register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

// GET /dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.get('/resend', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.redirect('/register.html');

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await db.query('UPDATE users SET confirmation_code = $1 WHERE email = $2', [code, email]);
    await sendConfirmationEmail(email, code);
    res.redirect(`/confirm.html?email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error('Ошибка при повторной отправке:', err);
    res.send('Не удалось отправить письмо. Попробуйте позже.');
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Необработанное отклонение промиса:', reason);
});

import crypto from 'crypto';

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userCheck.rows.length === 0) {
      return res.status(400).send('Пользователь с таким email не найден');
    }

    // если пользователь найден, продолжи генерацию токена и отправку письма:
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 час

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
      [token, expires, email]
    );

    await sendResetPasswordEmail(email, token);

    res.status(200).send('Ссылка отправлена');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.post('/reset-password', async (req, res) => {

  const { email, token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send('Пароли не совпадают. <a href="/reset-password.html">Назад</a>');
  }

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user || user.reset_token !== token || new Date(user.reset_token_expires) < new Date()) {
    return res.send('Ссылка недействительна или истек срок. <a href="/forgot-password.html">Попробовать снова</a>');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2',
    [hashedPassword, email]
  );

  res.redirect('/reset-password.html?reset=success');
});

app.post('/resend-confirmation', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) return res.status(400).send('Email обязателен');

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
// 🔍 Проверка: есть ли пользователь
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      console.log(`❌ Пользователь с email ${email} не найден`);
      return res.status(404).send('Пользователь не найден');
}

    await db.query('UPDATE users SET confirmation_code = $1 WHERE email = $2', [code, email]);
    await sendConfirmationEmail(email, code);
    console.log('📨 Код подтверждения отправлен по кнопке повторно:', email);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Ошибка при повторной отправке через кнопку:', err);
    res.status(500).send('Ошибка при отправке письма');
  }
});


//app.listen(3000, () => console.log('Сервер запущен на http://localhost:3000'));
export default app;
