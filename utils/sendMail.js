const nodemailer = require("nodemailer");

const ejs = require('ejs');
const path = require('path');



const sendMail = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} ${process.env.FROM_EMAIL}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};


const sendInvitation = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  

  try {
    // Construct the path to the template file
    const templatePath = path.join(__dirname, '..', 'view', 'invitation.ejs');

    // Render the EJS template with dynamic data
    const emailContent = await ejs.renderFile(templatePath, options );


    const message = {
      from: `${process.env.FROM_NAME} ${process.env.FROM_EMAIL}`,
      to: options.email,
      subject: options.subject,
      html: emailContent
    };


    await transporter.sendMail(message);
    console.log("Email Sent Successfully")
  } catch (error) {
    console.log("error", error);
  }

};


const sendCreds = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  

  try {
    // Construct the path to the template file
    const templatePath = path.join(__dirname, '..', 'view', 'creds.ejs');

    // Render the EJS template with dynamic data
    const emailContent = await ejs.renderFile(templatePath, options );


    const message = {
      from: `${process.env.FROM_NAME} ${process.env.FROM_EMAIL}`,
      to: options.email,
      subject: options.subject,
      html: emailContent
    };


    await transporter.sendMail(message);
    console.log("Email Sent Successfully")
  } catch (error) {
    console.log("error", error);
  }

};


const sendOTP = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  

  try {
    // Construct the path to the template file
    const templatePath = path.join(__dirname, '..', 'view', 'otp.ejs');

    // Render the EJS template with dynamic data
    const emailContent = await ejs.renderFile(templatePath, options );


    const message = {
      from: `${process.env.FROM_NAME} ${process.env.FROM_EMAIL}`,
      to: options.email,
      subject: options.subject,
      html: emailContent
    };


    await transporter.sendMail(message);
    console.log("OTP Email Sent Successfully")
  } catch (error) {
    console.log("error", error);
  }

};


module.exports = {
  sendInvitation,
  sendCreds,
  sendOTP
}


