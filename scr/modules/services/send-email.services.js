import nodemailer from 'nodemailer'


const sendEmailService=({to = '', // 'email1' , 'email1,email2,email3'
        subject = 'no-reply',
        message = '<h1>no-message</h1>',
        attachments = []})=>{
    const transporter=nodemailer.createTransport({
        host: 'localhost', // smtp.gmail.com
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const info=transporter.sendMail({
        from: `"Fred Foo 👻" <${process.env.EMAIL}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        html: message, // html body,
        attachments
    })
    return info.accepted.length ? true:false
}
export default sendEmailService