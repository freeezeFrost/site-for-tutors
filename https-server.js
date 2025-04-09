const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');

const app = express();

// Путь до публичной папки
app.use(express.static(path.join(__dirname, 'public')));

// Редирект с / на /login.html
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Путь до сертификатов
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/upformula.ru/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/upformula.ru/fullchain.pem'),
};

// Запуск HTTPS сервера
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS сервер запущен на https://upformula.ru');
});
