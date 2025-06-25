import nodemailer from 'nodemailer';
import Logger from './logger';
import config from '../config/config';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  auth: {
    user: config.email.username,
    pass: config.email.password
  }
});

export const sendEmail = async (options: EmailOptions) => {
  try {
    const mailOptions = {
      from: config.email.from,
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    await transporter.sendMail(mailOptions);
    Logger.info(`Email sent to ${options.email}`);
  } catch (error) {
    Logger.error('Error sending email:', error);
    throw new Error('There was an error sending the email. Try again later!');
  }
};