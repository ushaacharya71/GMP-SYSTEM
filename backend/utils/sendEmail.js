import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  // 🔐 Safety check
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_LOGIN ||
    !process.env.SMTP_PASSWORD
  ) {
    throw new Error("SMTP credentials missing");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,          // smtp-relay.brevo.com
    port: Number(process.env.SMTP_PORT),  // 587
    secure: false,                        // TLS
    auth: {
      user: process.env.SMTP_LOGIN,       // 8643ac001@smtp-brevo.com
      pass: process.env.SMTP_PASSWORD,    // xsmtpsib-xxxx
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM, // "Glowlogics GMP <help@glowlogics.in>"
    to,
    subject,
    html,
  });
};

export default sendEmail;
