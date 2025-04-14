import https from 'https';
import fs from 'fs';
import express from 'express';
import path from 'path';
import app from './server/server.js';

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/upformula.ru/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/upformula.ru/fullchain.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS сервер запущен на https://upformula.ru');
});
