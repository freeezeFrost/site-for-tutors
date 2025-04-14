import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'officeupformula@gmail.com',
    pass: 'qbfn zroj fzll xlln'
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

  const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://upformula.ru'
  : 'http://localhost:3000';

  const resetLink = `${BASE_URL}/reset-password.html?email=${toEmail}&token=${token}`;

  const mailOptions = {
    from: '"UpFormula" <officeupformula@gmail.com>',
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