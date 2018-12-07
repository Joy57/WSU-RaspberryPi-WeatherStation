
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    //Port 587 is an MSA (message submission agent) port that requires SMTP authentication
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }

});

const message = {
    from: 'wstationtestdod@gmail.com',
    to: 'tmalarkey14@gmail.com',
    subject: 'Weather Alert!',
    text: 'Hello Testing'
};


transporter.sendMail(message, (error, info) => {
    if (error) {
        return console.log(error);
    }
});

export default transporter
