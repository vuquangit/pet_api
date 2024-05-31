import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from '@/modules/users/entity/user.entity';

@Injectable()
export class MailingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async testMail(email: string): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email, // list of receivers
        from: `"Pet" <${this.configService.get<string>('MAIL_USER')}>`, // sender address
        subject: 'Pet - Test mail', // Subject line
        template: 'test/index',
        context: {
          title: 'Test mail',
        },
      });

      return true;
    } catch (error) {
      return error;
    }
  }

  async createdUser(user: User): Promise<boolean> {
    if (!user.email) return false;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: `"Pet" <${this.configService.get<string>('MAIL_USER')}>`, // override default from
        subject: 'Pet - Welcome',
        template: 'auth/create-user',
        context: {
          name: user?.name || '',
          urlLogin: this.configService.get<string>('WEB_URL'),
        },
      });

      return true;
    } catch (error) {
      return error;
    }
  }

  async sendPasswordReset(
    email: string,
    token: string,
    expiresIn: string,
  ): Promise<boolean> {
    if (!email || !token) return false;

    console.log('email', email, token);

    const urlForgotPassword =
      this.configService.get<string>('WEB_URL') +
      '/forgot-password?token=' +
      token;

    try {
      await this.mailerService.sendMail({
        to: email,
        from: `"Pet - No Reply" <${this.configService.get<string>('MAIL_USER')}>`,
        subject: 'Pet - Forgot Password',
        template: 'auth/forgot-password',
        context: {
          email,
          urlForgotPassword,
          expiresIn,
        },
      });

      return true;
    } catch (error) {
      return error;
    }
  }

  async sendNotiChangedPassword(email: string): Promise<boolean> {
    if (!email) return false;

    try {
      await this.mailerService.sendMail({
        to: email,
        from: `"Pet - No Reply" <${this.configService.get<string>('MAIL_USER')}>`,
        subject: 'Pet - Changed Password',
        template: 'auth/changed-password',
        context: {
          email,
          urlLogin: this.configService.get<string>('WEB_URL'),
        },
      });

      return true;
    } catch (error) {
      return error;
    }
  }
}
