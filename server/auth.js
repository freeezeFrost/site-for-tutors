const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');


function getUsers() {
  if (!fs.existsSync(usersFilePath)) return [];
  return JSON.parse(fs.readFileSync(usersFilePath));
}

function register({ firstName, lastName, email, phone, password }) {
  const users = getUsers();

  if (users.find(user => user.email === email)) return false;

  const hashedPassword = bcrypt.hashSync(password, 10);

  users.push({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    confirmed: false
  });

  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  return true;
}


function login(email, password) {
  const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  const user = users.find(user => user.email === email);
  if (!user) return false;
  if (!user.confirmed) return 'not-confirmed';

  return bcrypt.compareSync(password, user.password) ? user : false;

}


module.exports = { register, login };
