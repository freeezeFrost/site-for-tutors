const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'officeupformula@gmail.com',
    pass: 'qbfn zroj fzll xlln'
  }
});

function sendConfirmationEmail(toEmail, code) {
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

  return transporter.sendMail(mailOptions);
}

module.exports = { sendConfirmationEmail };
