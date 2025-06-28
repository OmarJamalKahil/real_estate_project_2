




// mail/dto/send-mail.dto.ts
export class SendMailDto {
  to: string;
  subject: string;
  text: string;
  html?: string;
}
