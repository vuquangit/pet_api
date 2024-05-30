// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom, from, Observable, switchMap } from 'rxjs';

import { IUserToken } from '@/modules/auth/interfaces/auth.interface';
import { ConfigService } from '@nestjs/config';
import { User } from '@/modules/users/entity/user.entity';

import { LoginUserDto } from '@/modules/auth/dtos/LoginUser.dto';
import { ChangePasswordDto } from '@/modules/auth/dtos/ChangePassword.dto';
import { ForgotPasswordDto } from '@/modules/auth/dtos/ForgotPassword.dto';
import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  generateTokens(user: User): Observable<IUserToken> {
    return from(
      Promise.all([
        this.jwtService.signAsync(
          { user },
          {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get<string>(
              'JWT_ACCESS_SECRET_EXPIRES',
            ),
          },
        ),

        this.jwtService.signAsync(
          { user },
          {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get<string>(
              'JWT_REFRESH_SECRET_EXPIRES',
            ),
          },
        ),
      ]).then((tokens) => ({
        accessToken: tokens[0],
        refreshToken: tokens[1],
      })),
    );
  }

  hashPassword(password: string): Observable<string> {
    const saltLength = +(this.configService.get<string>('BCRYPT_SALT') || 12);
    return from<string>(bcrypt.hash(password, saltLength));
  }

  comparePasswords(
    password: string,
    storedPasswordHash: string,
  ): Observable<any> {
    return from(bcrypt.compare(password, storedPasswordHash));
  }

  randomPassword(): string {
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const passwordLength = 12;
    let password = '';

    for (let i = 0; i <= passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }

    return password;
  }

  private validatePassword(
    password: string,
    storedPasswordHash: string,
  ): Observable<boolean> {
    return this.comparePasswords(password, storedPasswordHash);
  }

  login(loginUserDto: LoginUserDto): Observable<IUserToken> {
    return this.usersService.findUserByEmail(loginUserDto.email).pipe(
      switchMap((user: User) => {
        if (!user) {
          throw new NotFoundException({
            code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
            message: 'Email not found',
          });
        }

        return this.validatePassword(loginUserDto.password, user.password).pipe(
          switchMap((passwordsMatches: boolean) => {
            if (passwordsMatches) {
              return this.usersService
                .findById(user.id)
                .pipe(switchMap((user: User) => this.generateTokens(user)));
            }

            throw new BadRequestException({
              code: EXCEPTION_CODE.USER.WRONG_PASSWORD,
              message: 'Password is incorrect',
            });
          }),
        );
      }),
    );
  }

  refreshToken(user: User): Observable<any> {
    return this.usersService
      .findById(user['id'])
      .pipe(switchMap((user: User) => this.generateTokens(user)));
  }

  changePassword(user: User, changePassword: ChangePasswordDto): any {
    return this.usersService.findUserByEmail(user.email).pipe(
      switchMap((user: User): any => {
        return this.validatePassword(
          changePassword.password,
          user.password,
        ).pipe(
          switchMap((passwordsMatches: boolean) => {
            if (!passwordsMatches) {
              throw new BadRequestException({
                code: EXCEPTION_CODE.USER.WRONG_PASSWORD,
                message: 'Password is incorrect',
              });
            }

            console.log('changePassword', changePassword);

            return this.hashPassword(changePassword.new_password).pipe(
              switchMap((passwordHash: string) => {
                console.log('passwordHash', passwordHash);

                user['password'] = passwordHash;
                return from(this.usersService.updatePassword(user));
              }),
            );
          }),
        );
      }),
    );
  }

  // TODO: send email with token
  async sendPasswordReset(forgotPassword: ForgotPasswordDto): Promise<void> {
    // const passwordRandom = this.randomPassword();
    // return from(
    //   this.mailService.sendNewPassword(forgotPassword.email, passwordRandom),
    // ).pipe(
    //   switchMap(() => {
    //     return this.findUserByEmail(forgotPassword.email).pipe(
    //       switchMap((user: User) => {
    //         return this.hashPassword(passwordRandom).pipe(
    //           map((passwordHash: string) => {
    //             this.usersRepository.update(user.id, {
    //               ...user,
    //               password: passwordHash,
    //             });

    //             return true;
    //           }),
    //         );
    //       }),
    //     );
    //   }),
    // );

    const { email } = forgotPassword;
    const user = await firstValueFrom(this.usersService.findUserByEmail(email));
    if (!user) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
        message: 'Email not found',
      });
    }

    // const token = this.jwtService.sign({ email }, { expiresIn: '1h' });

    // // Save the token or a hash of it to validate later
    // const hashedToken = await bcrypt.hash(token, 10);
    // await this.usersService.updateResetToken(user.id, hashedToken);

    // const url = `http://your-app.com/reset-password?token=${token}`;

    // await this.mailerService.sendMail({
    //   to: email,
    //   subject: 'Password Reset Request',
    //   template: './reset-password', // the template file name
    //   context: {  // data to be sent to template
    //     name: user.name,
    //     url,
    //   },
    // });
  }

  // TODO: validate token and change password
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // const decoded = this.jwtService.verify(token);
    // const user = await this.usersService.findByEmail(decoded.email);
    // if (!user) {
    //   throw new Error('User not found');
    // }
    //
    // const isValid = await bcrypt.compare(token, user.resetToken);
    // if (!isValid) {
    //   throw new Error('Invalid or expired token');
    // }
    //
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await this.usersService.updatePassword(user.id, hashedPassword);
  }
}
