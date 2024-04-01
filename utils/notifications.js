const nodemailer = require("nodemailer");

const ejs = require('ejs');
const path = require('path');

const { initializeApp } = require('firebase/app');
const { getDatabase, set, ref, onValue } = require('firebase/database');

const ShortUniqueId = require("short-unique-id");

const UserModel = require("../models/UserModel.js");

const admin = require("firebase-admin");


const firebaseConfig = {
  apiKey: "AIzaSyBvYQH1b8Qbj-eFzSM3Rqw1jOtqB4-ciYo",
  authDomain: "gotruckingnew-d3860.firebaseapp.com",
  projectId: "gotruckingnew-d3860",
  storageBucket: "gotruckingnew-d3860.appspot.com",
  messagingSenderId: "341130354387",
  appId: "1:341130354387:web:bca990973912fdfed23e26",
  measurementId: "G-Y1RWV6DJ4L"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseDB = getDatabase(app);  

// const servercCredentials = require("./fcm.json")

// admin.initializeApp({
//     credential: admin.credential.cert(servercCredentials),
//     databaseURL: "https://gotruckingnew-d3860-default-rtdb.firebaseio.com"
// });


// Admin Notifications
const notification = (title, description, actor, module) => {
    const uid = new ShortUniqueId();
    set(ref(firebaseDB, `notifications/${uid()}`), {
        title,
        description,
        actor,
        module,
        time: new Date().getTime()
    });
}

const riderSendMail = async options => {

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
    try{
        
        // Construct the path to the template file
        const templatePath = path.join(__dirname, '..', 'view', 'pdf.ejs');

        // Render the EJS template with dynamic data
        const emailContent = await ejs.renderFile(templatePath, options );
      
        const message = {
          from: `${process.env.FROM_NAME} ${process.env.FROM_EMAIL}`,
          to: options.email,
          subject: options.subject,
          html: emailContent,
        };
      
        await transporter.sendMail(message);
        console.log("Email Sent Successfully")
    } catch(err){
        console.log("rider mail error", err)
    }

};

const riderPushNotifications = async options => {
    try {
        const { title, body, tokens } = options;
        await admin.messaging().sendMulticast({
          tokens,
          notification: {
            title,
            body,
          },
        });
        console.log("Successfully sent notifications!")
      } catch (err) {
        console.log("rider push notifications error", err)
      }
}

const riderNotifications = (title, description, status, riderId) => {
    const uid = new ShortUniqueId();
    set(ref(firebaseDB, `${riderId}/${uid()}`), {
        title,
        description,
        status,
        time: new Date().getTime()
    });
}


const allRidersNotifications = async(title, description, nStatus, user, link) => {

    try{
        const userData = await UserModel.findById(user);
    
        if(userData){

          console.log("userData.FCMToken", userData.FCMToken)
    
            if(userData.FCMToken){
                riderPushNotifications({title, body: description, tokens: [userData.FCMToken]})
            }
    
            riderNotifications(title, description, nStatus, user);
            riderSendMail({email: userData.email, subject: title, message: description, link})
    
        }
        
    } catch(error){
        console.log("unable to send riders notifications")
    }



}

const contractorSendMail = async options => {

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
    try{
        
        // Construct the path to the template file
        const templatePath = path.join(__dirname, '..', 'view', 'pdf.ejs');

        // Render the EJS template with dynamic data
        const emailContent = await ejs.renderFile(templatePath, options );
      
        const message = {
          from: `${process.env.FROM_NAME} ${process.env.FROM_EMAIL}`,
          to: options.email,
          subject: options.subject,
          html: emailContent,
        };
      
        await transporter.sendMail(message);
        console.log("Email Sent Successfully")
    } catch(err){
        console.log("contractor mail error", err)
    }

};


const sendTrackingLink = async options => {

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
    try{
        
        // Construct the path to the template file
        const templatePath = path.join(__dirname, '..', 'view', 'trackingLink.ejs');

        // Render the EJS template with dynamic data
        const emailContent = await ejs.renderFile(templatePath, options );
      
        const message = {
          from: `${process.env.FROM_NAME} ${process.env.FROM_EMAIL}`,
          to: options.email,
          subject: options.subject,
          html: emailContent,
        };
      
        await transporter.sendMail(message);
        console.log("Tracking Link Email Sent Successfully")
    } catch(err){
        console.log("Tracking Link Email error", err)
    }

};

const sendInvoiceToCustomer = async options => {

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
    try{
        
        // Construct the path to the template file
        const templatePath = path.join(__dirname, '..', 'view', 'Invoice.ejs');

        // Render the EJS template with dynamic data
        const emailContent = await ejs.renderFile(templatePath, options );
      
        const message = {
          from: `${process.env.FROM_NAME} ${process.env.FROM_EMAIL}`,
          to: options.email,
          subject: options.subject,
          html: emailContent,
        };
      
        await transporter.sendMail(message);
        console.log("Email Sent Successfully")
    } catch(err){
        console.log("contractor mail error", err)
    }

};

module.exports = {notification, riderNotifications, riderSendMail, riderPushNotifications, allRidersNotifications, contractorSendMail, sendTrackingLink, sendInvoiceToCustomer};


