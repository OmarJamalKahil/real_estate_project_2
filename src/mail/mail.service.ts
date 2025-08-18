import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        // user: 'ahmed09887766554@gmail.com',
        // pass: 'ftkv zfan mviz aduq',
        user: 'ahmed7733931@gmail.com',
        pass: 'mrfv gpsk dvac whkg',
      },

    });
  }


  async sendMail(to: string, code: string): Promise<void> {
    const mailOptions = {
      from: 'ahmed7733931@gmail.com', // Must match the authenticated user
      to,
      subject: 'Verifying Account',
      // text: 'This is a plain text body for test email.',
      html: "<b>" + code + "</b>",
    };


    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}