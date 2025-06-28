// // mail/mail.service.ts
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';

// @Injectable()
// export class MailService {
//   private transporter: nodemailer.Transporter;

//   constructor(private configService: ConfigService) {
//     this.transporter = nodemailer.createTransport({
//       host: this.configService.get<string>('EMAIL_HOST'),
//       port: this.configService.get<number>('EMAIL_PORT'),
//       secure: false, // true for 465, false for 587
//       auth: {
//         user: this.configService.get<string>('EMAIL_USER'),
//         pass: this.configService.get<string>('EMAIL_PASS'),
//       },
//     });
//   }

//   async sendMail(to: string, subject: string, text: string, html?: string) {
//     await this.transporter.sendMail({
//       from: `"No Reply" <${this.configService.get<string>('EMAIL_USER')}>`,
//       to,
//       subject,
//       text,
//       html,
//     });
//   }
// }







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
        user: 'ahmed09887766554@gmail.com',
        pass: 'ybim gjed fhun dwqg',
      },

    });
  }

  async sendMail(to: string, code: string): Promise<void> {
    const mailOptions = {
      from: 'ahmed09887766554@gmail.com', // Must match the authenticated user
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