const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 Вот эта строка должна быть ДО роутов
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());

// Отдача index.html по корню сайта
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/submit', (req, res) => {
  const newTutor = req.body;
  const filePath = path.join(__dirname, '../data/tutors.json');
  let data = [];
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath));
  }
  data.push(newTutor);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(200).send({ message: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
