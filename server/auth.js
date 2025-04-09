
const fs = require('fs');
const path = require('path');
const usersFile = path.join(__dirname, '../data/users.json');

function register(username, password) {
  const users = getUsers();
  if (users.find(u => u.username === username)) return false;
  users.push({ username, password });
  fs.writeFileSync(usersFile, JSON.stringify(users));
  return true;
}

function login(username, password) {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password);
}

function getUsers() {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile));
}

module.exports = { register, login };
