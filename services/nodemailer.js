const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.email,
    pass: process.env.password
  }
});

module.exports = {
  sendForgotPasswordEmail: (to, link) => {
    var mailOptions = {
      from: 'contato@dlwalt.com',
      to,
      subject: 'Recuperação de conta - D Walt Gestão',
      html: `Entre nesse link para resetar sua senha:\n\n${link}`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('[EMAIL] Sent ' + info.response);
      }
    });
  }
};