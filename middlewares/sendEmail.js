require('dotenv').config();
const nodemailer = require("nodemailer");

exports.sendEmail = async (email, link) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "masudzamanf@gmail.com",
          pass: process.env.GMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: "masudzamanf@gmail.com",
        to: email,
        subject: "Reset Password",
        text: link
    };
    
    
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent");
        }
    });

}



