const nodemailer = require('nodemailer');
require('dotenv').config();

class MasterMail {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Or use host/port from env
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });
    }

    async send(to, subject, view, data) {
        // "view" would be a template name.
        // For now, we'll just send a generic message or assume 'data' contains body content.
        // In a real implementation, we'd use a template engine like EJS or Handlebars.

        const mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS || 'admin@gymnexus.com',
            to: to,
            subject: subject,
            html: `<h1>${subject}</h1><p>Content for view: ${view}</p><pre>${JSON.stringify(data, null, 2)}</pre>`
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}

module.exports = new MasterMail();
