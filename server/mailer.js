import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

const BASE_URL = process.env.BASE_URL;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function sendConfirmationEmail(toEmail, code) {
  const mailOptions = {
    from: '"UpFormula" <officeupformula@gmail.com>',
    to: toEmail,
    subject: 'Код подтверждения регистрации',
    html: `
      <h2>Добро пожаловать в UpFormula!</h2>
      <p>Ваш код подтверждения:</p>
      <h1 style="letter-spacing: 3px;">${code}</h1>
      <p>Введите его на сайте для завершения регистрации.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Письмо успешно отправлено:', info.response);
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
    throw error; // важно — пробрасываем ошибку обратно
  }
}

async function sendResetPasswordEmail(toEmail, token) {

  const resetLink = `${BASE_URL}/reset-password.html?email=${toEmail}&token=${token}`;

  const mailOptions = {
    from: '"UpFormula" <${process.env.GMAIL_USER}>',
    to: toEmail,
    subject: 'Восстановление пароля',
    html: `
      <h2>Восстановление пароля</h2>
      <p>Вы запросили восстановление пароля. Чтобы сбросить пароль, перейдите по ссылке ниже:</p>
      <a href="${resetLink}" style="color: #007bff;">Сбросить пароль</a>
      <p>Если вы не запрашивали восстановление, просто проигнорируйте это письмо.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Письмо для восстановления пароля отправлено:', info.response);
  } catch (error) {
    console.error('Ошибка при отправке письма восстановления:', error);
    throw error;
  }
}

export { sendConfirmationEmail, sendResetPasswordEmail };