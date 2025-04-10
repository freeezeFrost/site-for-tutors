const { sendConfirmationEmail } = require('./mailer');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path'); // ← вот это должно быть ДО использования path

const { register, login, confirmEmail } = require('./auth');

const app = express();

const confirmPath = path.join(__dirname, '../data/confirmations.json'); // ← теперь всё будет ок

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/register', (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send('Пароли не совпадают. <a href="/register.html">Назад</a>');
  }

  const tempDomains = [
    '10minutemail.com', 'yopmail.com', 'mailinator.com',
    'guerrillamail.com', 'temp-mail.org', 'tempmail.lol'
  ];
  
  const emailDomain = email.split('@')[1];
  if (tempDomains.includes(emailDomain)) {
    return res.send('Пожалуйста, используйте реальный email. Временные почтовые сервисы запрещены.');
  }  

  const success = register({
    firstName,
    lastName,
    email,
    password
  });

  if (success) {
    // Генерация 6-значного кода
const code = Math.floor(100000 + Math.random() * 900000);

// Сохраняем код по email
const confirmations = fs.existsSync(confirmPath)
  ? JSON.parse(fs.readFileSync(confirmPath))
  : {};
confirmations[email] = code;
fs.writeFileSync(confirmPath, JSON.stringify(confirmations, null, 2));

// Отправляем письмо
sendConfirmationEmail(email, code)
  .then(() => {
    res.redirect(`/confirm.html?email=${encodeURIComponent(email)}`);
  })
  .catch(err => {
    console.error('Ошибка отправки:', err);
    res.send('Не удалось отправить письмо. Попробуйте позже.');
  });

  } else {
    res.redirect('/user-exists.html');
  }
});


app.post('/confirm', (req, res) => {
  const { email, code } = req.body;

  const confirmPath = path.join(__dirname, '../data/confirmations.json');
  const confirmations = fs.existsSync(confirmPath)
    ? JSON.parse(fs.readFileSync(confirmPath))
    : {};

  if (confirmations[email] && confirmations[email].toString() === code) {
    // Код верный — обновим статус confirmed у пользователя
const usersPath = path.join(__dirname, '../data/users.json');
const users = JSON.parse(fs.readFileSync(usersPath));
const userIndex = users.findIndex(u => u.email === email);
if (userIndex !== -1) {
  users[userIndex].confirmed = true;
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// Удалим код
delete confirmations[email];
fs.writeFileSync(confirmPath, JSON.stringify(confirmations, null, 2));

// Перенаправим на вход
return res.redirect('/confirm.html?status=success');

  } else {
    // Неверный код — сообщение об ошибке
    return res.redirect(`/confirm.html?email=${encodeURIComponent(email)}&status=error`);

  }
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const result = login(email, password);

if (result === 'not-confirmed') {
  return res.redirect('/not-confirmed.html');
}

if (result) {
  return res.redirect('/dashboard.html');
} else {
  return res.redirect('/login.html?error=true');
}
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

app.get('/resend', (req, res) => {
  const email = req.query.email;
  if (!email) return res.redirect('/register.html');

  const code = Math.floor(100000 + Math.random() * 900000);

  const confirmPath = path.join(__dirname, '../data/confirmations.json');
  const confirmations = fs.existsSync(confirmPath)
    ? JSON.parse(fs.readFileSync(confirmPath))
    : {};
  confirmations[email] = code;
  fs.writeFileSync(confirmPath, JSON.stringify(confirmations, null, 2));

  sendConfirmationEmail(email, code)
    .then(() => {
      res.redirect(`/confirm.html?email=${encodeURIComponent(email)}`);
    })
    .catch(err => {
      console.error('Ошибка при повторной отправке:', err);
      res.send('Не удалось отправить письмо. Попробуйте позже.');
    });
});



//app.listen(3000, () => console.log('Сервер запущен на http://localhost:3000'));
module.exports = app;
