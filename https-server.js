const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');

const app = require('./server/server'); // Подключаем готовое express-приложение

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/upformula.ru/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/upformula.ru/fullchain.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS сервер запущен на https://upformula.ru');
});
