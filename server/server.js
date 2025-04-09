
const express = require('express');
const bodyParser = require('body-parser');
const { register, login } = require('./auth');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/register', (req, res) => {
  if (register(req.body.username, req.body.password)) {
    res.redirect('/login.html');
  } else {
    res.send('Пользователь уже существует. <a href="/register.html">Назад</a>');
  }
});

app.post('/login', (req, res) => {
  if (login(req.body.username, req.body.password)) {
    res.redirect('/dashboard.html');
  } else {
    res.send('Неверные данные. <a href="/login.html">Назад</a>');
  }
});

const path = require('path'); // если ещё не подключил

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


app.listen(3000, () => console.log('Сервер запущен на http://localhost:3000'));
