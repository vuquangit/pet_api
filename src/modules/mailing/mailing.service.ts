import { from, Observable, EMPTY } from 'rxjs';
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

  testMail(email: string): any {
    try {
      return from(
        this.mailerService.sendMail({
          to: email, // list of receivers
          from: `"Pet" <${this.configService.get<string>('MAIL_USER')}>`, // sender address
          subject: 'Pet - Test mail', // Subject line
          template: 'test/index',
          context: {
            title: 'Test mail',
          },
        }),
      );
    } catch (error) {}
  }

  createdUser(user: User): Observable<any> {
    if (!user.email) return EMPTY;

    try {
      return from(
        this.mailerService.sendMail({
          to: user.email,
          from: `"Pet" <${this.configService.get<string>('MAIL_USER')}>`, // override default from
          subject: 'Pet - Welcome',
          template: 'auth/create-user',
          context: {
            name: user?.name || '',
            urlLogin: this.configService.get<string>('WEB_URL'),
          },
        }),
      );
    } catch (error) {
      console.log('Send mail error:', error);
      return EMPTY;
    }
  }

  forgotPassword(email: string): Observable<any> {
    if (!email) return EMPTY;

    const urlForgotPassword =
      this.configService.get<string>('WEB_URL') + '/forgot-password?token=';
    if (!urlForgotPassword) return EMPTY;

    try {
      return from(
        this.mailerService.sendMail({
          to: email,
          from: `"Pet - No Reply" <${this.configService.get<string>('MAIL_USER')}>`, // override default from
          subject: 'Pet - Forgot Password',
          template: 'auth/forgot-password',
          context: {
            name: email,
            urlForgotPassword,
          },
        }),
      );
    } catch (error) {
      console.log('Send mail error:', error);
      return EMPTY;
    }
  }

  sendUserConfirmation(user: User, password: string): Observable<any> {
    if (!user.email) return EMPTY;

    return from(
      this.mailerService.sendMail({
        to: user.email,
        from: `"Pet" <${this.configService.get<string>('MAIL_USER')}>`, // override default from
        subject: 'Pet - Your password',
        // template: 'auth/confirm', // `.hbs` extension is appended automatically
        // context: {
        //   email: user.email,
        //   password,
        // },
        text: 'Create password',
        html: `
          <h2>Hello new user</h2>
          <p>Login URL: ${this.configService.get<string>(
            'MAIL_WEB_LOGIN_URL',
          )}</p>
          <p>Email: ${user.email}</p>
          <p>Password: ${password}</p>
          `,
      }),
    );
  }

  sendNewPassword(email: string, newPassword: string): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!email) return;

    return from(
      this.mailerService.sendMail({
        to: email,
        from: `"Pet" <${this.configService.get<string>('MAIL_USER')}>`, // override default from
        subject: 'Pet - Mật khẩu mới',
        text: 'Mật khẩu mới',
        html: `
          <h2>Mật khẩu mới</h2>
          <p>Link đăng nhập: ${this.configService.get<string>(
            'MAIL_WEB_LOGIN_URL',
          )}</p>
          <p>Email: ${email}</p>
          <p>Mật khẩu: ${newPassword}</p>
          `,
      }),
    );
  }

  sendNotiChangedPassword(email: string): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!email) return;

    // try {
    return from(
      this.mailerService.sendMail({
        to: email,
        from: `"Pet" <${this.configService.get<string>('MAIL_USER')}>`, // override default from
        subject: 'Pet - Thay đổi mật khẩu',
        text: 'Thay đổi mật khẩu',
        html: `
          <h2>Thay đổi mật khẩu</h2>
          <p>Bạn vừa đổi mật khẩu mới thành công</p>
          `,
      }),
    );
    // } catch {}
  }
}
