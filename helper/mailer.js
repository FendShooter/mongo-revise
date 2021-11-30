const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'oldhumblelion@gmail.com', // generated ethereal user
      pass: 'Humblelion', // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // send mail with defined transport object
  let message = {
    from: 'oldhumblelion@gmail.com', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = { sendEmail };
