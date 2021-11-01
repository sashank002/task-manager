const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "satvan2002@gmail.com",
    subject: 'Thanks for joining sat"s task manager',
    text: `kem cho , majama ? ${name} `,
  });
};

module.exports = {
  sendWelcomeEmail,
};
