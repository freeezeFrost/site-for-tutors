const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');

const app = express();

// Чтение SSL-сертификатов
const privateKey = fs.readFileSync('/etc/letsencrypt/live/upformula.ru/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/upformula.ru/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Подключаем статику (папка public)
app.use(express.static(path.join(__dirname, 'public')));

// Запуск HTTPS-сервера
https.createServer(credentials, app).listen(443, () => {
  console.log('HTTPS server running on port 443');
});

