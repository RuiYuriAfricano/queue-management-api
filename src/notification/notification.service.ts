import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  // Configuração para o Nodemailer
  private mailTransporter = nodemailer.createTransport({
    service: 'gmail', // Substituir pelo serviço de e-mail desejado
    auth: {
      user: process.env.EMAIL_USER, // Endereço de e-mail
      pass: process.env.EMAIL_PASSWORD, // Senha do e-mail ou App Password
    },
  });

  // Configuração para Twilio
  private twilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  // Configuração para UltraMsg
  private ultraMsgApiUrl = 'https://api.ultramsg.com';
  private ultraMsgInstance = process.env.ULTRAMSG_INSTANCE_ID;
  private ultraMsgToken = process.env.ULTRAMSG_TOKEN;

  // Enviar e-mail
  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: message,
      };

      await this.mailTransporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error('Email sending failed');
    }
  }

  // Enviar SMS
  async sendSms(to: string, message: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER, // Número registrado no Twilio
        to,
      });
      this.logger.log(`SMS sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      throw new Error('SMS sending failed');
    }
  }

  // Enviar mensagem pelo WhatsApp
  async sendWhatsApp(to: string, message: string): Promise<void> {
    try {
      const url = `${this.ultraMsgApiUrl}/${this.ultraMsgInstance}/messages/chat`;
      const data = {
        token: this.ultraMsgToken,
        to,
        body: message,
      };

      const response = await axios.post(url, data);
      if (response.data?.sent) {
        this.logger.log(`WhatsApp message sent to ${to}`);
      } else {
        throw new Error(`Failed to send WhatsApp message to ${to}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message to ${to}: ${error.message}`);
      throw new Error('WhatsApp message sending failed');
    }
  }
}
