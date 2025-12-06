const nodemailer = require('nodemailer');

module.exports = {

    envEmail: (to, subject, text, html) => {
        return new Promise((resolve, reject) => {

            let transporter = nodemailer.createTransport({
                service: 'gmail', // SMTP server address
                auth: {
                    user: process.env.GMAIL_USER, // SMTP username
                    pass: process.env.GMAIL_APP  // SMTP password
                },
            })

            let options = {
                from: process.env.GMAIL_USER, // sender address
                to: to,   // list of receivers
                subject: subject, // Subject line
                text: text, // plain text body
                html: html,  // html body
                cid: './media/nextTalents.png' // Content ID for the logo image
            }

            const sendEmail = async () => {
                try {
                    console.log('Sending email...')
                    let info = await transporter.sendMail(options)
                    console.log('Email sent: ' + info.response)
                } catch (error) {
                    console.error('Error sending email: ', error)
                }
            }
            sendEmail()

            resolve()
        });
    }

}