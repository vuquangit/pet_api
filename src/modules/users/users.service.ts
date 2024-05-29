import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { firstValueFrom, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
// import { HttpService } from '@nestjs/axios';

import { CreateUserDto } from '@/modules/users/dtos/CreateUser.dto';
import { LoginUserDto } from '@/modules/users/dtos/LoginUser.dto';
import { OauthLoginEmailDto } from '@/modules/users/dtos/OauthLogin.dto';
import { ChangePasswordDto } from '@/modules/users/dtos/ChangePassword.dto';
import { ForgotPasswordDto } from '@/modules/users/dtos/ForgotPassword.dto';

import { AuthService } from '@/modules/auth/auth.service';
import { IUserToken } from '@/modules/users/interfaces/user.interface';
import { User } from '@/modules/users/entity/user.entity';
import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { ERole } from './enums/role.enum';
import { PageDto } from '@/common/dtos/page.dto';
import { getMeta } from '@/utils/pagination';
// import { MailingService } from '@/modules/mailing/mailing.service';
// import { UploadService } from '@/modules/upload/upload.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private authService: AuthService,
    // private httpService: HttpService,
    // private mailService: MailingService,
    // private uploadService: UploadService,
  ) {}

  // user
  create(createdUserDto: CreateUserDto): Observable<any> {
    return this.mailExists(createdUserDto.email).pipe(
      switchMap((exists: boolean) => {
        if (exists) {
          throw new ConflictException({
            code: EXCEPTION_CODE.USER.EMAIL_EXIST,
            message: 'Email already in use',
          });
        }

        const passwordUser =
          createdUserDto.password || this.authService.randomPassword();

        return this.authService.hashPassword(passwordUser).pipe(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          switchMap((passwordHash: string) => {
            // Overwrite the user password with the hash, to store it in the db
            createdUserDto.password = passwordHash;

            ['birthday', 'start_date', 'end_date'].forEach(
              (fieldDate: keyof CreateUserDto) => {
                if (createdUserDto[fieldDate] === 'null')
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  createdUserDto[fieldDate] = null;
              },
            );

            // upload avatar
            if (createdUserDto.avatar) {
              // TODO: upload image
              const avatar_url = '';
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { avatar, ...restUserDto } = createdUserDto;
              const user: User = { ...restUserDto, avatar_url } as User;
              return this.saveUser(user, passwordUser);

              // return this.uploadService.uploadImage(createdUserDto.avatar).pipe(
              //   switchMap((data: any) => {
              //     createdUserDto.avatar_url = data.image_url;
              //     delete createdUserDto.avatar;
              //     return this.saveUser(createdUserDto, passwordUser);
              //   }),
              // );
            } else {
              return this.saveUser(createdUserDto as User, passwordUser);
            }
          }),
        );
      }),
    );
  }

  private saveUser(createdUserDto: User, passwordUser: string) {
    const newUser = this.usersRepository.create(createdUserDto);

    return from(this.usersRepository.save(newUser));

    // TODO: send mail
    // return from(this.usersRepository.save(newUser)).pipe(
    //   map((savedUser: User) => {
    //     // send mail
    //     // TODO: check mail send is success
    //     this.mailService.sendUserConfirmation(savedUser, passwordUser);

    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     const { password, ...user } = savedUser;
    //     return user;
    //   }),
    // );
  }

  login(loginUserDto: LoginUserDto): Observable<IUserToken> {
    return this.findUserByEmail(loginUserDto.email).pipe(
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
              return this.findById(user.id).pipe(
                switchMap((user: User) =>
                  this.authService.generateTokens(user),
                ),
              );
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

  update(id: string, updateUserDto: CreateUserDto): Observable<UpdateResult> {
    return from(this.usersRepository.findOneBy({ id: id })).pipe(
      switchMap((user: User) => {
        if (!user) {
          throw new NotFoundException({
            code: EXCEPTION_CODE.USER.ID_NOT_FOUND,
            message: `A user id '"${id}"' was not found`,
          });
        }

        return this.mailExists(updateUserDto.email, user.email).pipe(
          switchMap((exists: boolean) => {
            if (exists) {
              throw new ConflictException({
                code: EXCEPTION_CODE.USER.EMAIL_EXIST,
                message: 'Email already in use',
              });
            }

            ['birthday', 'start_date', 'end_date'].forEach(
              (fieldDate: keyof CreateUserDto) => {
                if (updateUserDto[fieldDate] === 'null')
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  updateUserDto[fieldDate] = null;
              },
            );

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { avatar, is_delete_avatar, ...restUser } = updateUserDto;

            return this.usersRepository.update(id, restUser as User);

            // // TODO: upload avatar
            // if (updateUserDto.avatar) {
            //   return this.uploadService.uploadImage(updateUserDto.avatar).pipe(
            //     switchMap((data: any) => {
            //       // TODO: delete image ?
            //       this.uploadService.deleteImage([updateUserDto.avatar_url]);

            //       updateUserDto.avatar_url = data.image_url;
            //       delete updateUserDto.avatar;
            //       delete updateUserDto.is_delete_avatar;

            //       return this.usersRepository.update(id, updateUserDto);
            //     }),
            //   );
            // } else {
            //   // TODO: delete image
            //   if (updateUserDto.is_delete_avatar) {
            //     this.uploadService.deleteImage([updateUserDto.avatar_url]);
            //     updateUserDto.avatar_url = null;
            //   }

            //   delete updateUserDto.is_delete_avatar;

            //   return this.usersRepository.update(id, updateUserDto);
            // }
          }),
        );
      }),
    );
  }

  remove(id: string): Observable<any> {
    // TODO: delete avatar

    return from(this.usersRepository.delete(id));
  }

  // auth
  refreshToken(user: User): Observable<any> {
    return this.findById(user['id']).pipe(
      switchMap((user: User) => this.authService.generateTokens(user)),
    );
  }

  // changePassword(user: User, changePassword: ChangePasswordDto): any {
  //   return this.findUserByEmail(user.email).pipe(
  //     switchMap((user: User): any => {
  //       return this.validatePassword(
  //         changePassword.password,
  //         user.password,
  //       ).pipe(
  //         switchMap((passwordsMatches: boolean) => {
  //           if (!passwordsMatches) {
  //             throw new BadRequestException({
  //               code: EXCEPTION_CODE.USER.WRONG_PASSWORD,
  //               message: 'Password is incorrect',
  //             });
  //           }

  //           return this.authService
  //             .hashPassword(changePassword.new_password)
  //             .pipe(
  //               switchMap((passwordHash: string) => {
  //                 return from(
  //                   this.usersRepository.update(user.id, {
  //                     ...user,
  //                     password: passwordHash,
  //                   }),
  //                 ).pipe(
  //                   switchMap((): any => {
  //                     return this.findById(user['id']).pipe(
  //                       map((userById: User) => {
  //                         this.mailService.sendNotiChangedPassword(
  //                           userById.email,
  //                         );

  //                         return true;
  //                       }),
  //                     );
  //                   }),
  //                 );
  //               }),
  //             );
  //         }),
  //       );
  //     }),
  //   );
  // }

  // forgotPassword(forgotPassword: ForgotPasswordDto): Observable<boolean> {
  //   const passwordRandom = this.authService.randomPassword();

  //   return from(
  //     this.mailService.sendNewPassword(forgotPassword.email, passwordRandom),
  //   ).pipe(
  //     switchMap(() => {
  //       return this.findUserByEmail(forgotPassword.email).pipe(
  //         switchMap((user: User) => {
  //           return this.authService.hashPassword(passwordRandom).pipe(
  //             map((passwordHash: string) => {
  //               this.usersRepository.update(user.id, {
  //                 ...user,
  //                 password: passwordHash,
  //               });

  //               return true;
  //             }),
  //           );
  //         }),
  //       );
  //     }),
  //   );
  // }

  // // oauth Google
  // private getOauthGoogleToken = async (code: string, redirectUri: string) => {
  //   const body = {
  //     code,
  //     client_id: process.env.GOOGLE_CLIENT_ID,
  //     client_secret: process.env.GOOGLE_CLIENT_SECRET,
  //     redirect_uri: redirectUri,
  //     grant_type: 'authorization_code',
  //   };

  //   try {
  //     const res = await this.httpService.axiosRef.post(
  //       `https://oauth2.googleapis.com/token`,
  //       body,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );
  //     return res?.data;
  //   } catch (err) {
  //     console.log(err?.message + ': ' + JSON.stringify(err?.response?.data));
  //   }
  // };

  // private getGoogleUser = async ({
  //   id_token,
  //   access_token,
  // }: {
  //   id_token: string;
  //   access_token: string;
  // }) => {
  //   try {
  //     const res = await this.httpService.axiosRef.get(
  //       `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}&alt=json`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${id_token}`,
  //         },
  //       },
  //     );
  //     return res?.data;
  //   } catch (err) {
  //     console.log(err?.message + ': ' + JSON.stringify(err?.response?.data));
  //   }
  // };

  // async oauthGoogle(code: string, redirectUri: string): Promise<IUserToken> {
  //   if (!code) {
  //     throw new NotFoundException({
  //       code: EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND,
  //       message: 'Code not found',
  //     });
  //   }

  //   const dataToken = await this.getOauthGoogleToken(code, redirectUri);
  //   const { id_token = '', access_token = '' } = dataToken;
  //   if (!id_token) {
  //     throw new NotFoundException({
  //       code: EXCEPTION_CODE.OAUTH.CODE_NOT_FOUND,
  //       message: 'token not found',
  //     });
  //   }

  //   const googleUser = await this.getGoogleUser({ id_token, access_token });
  //   if (!googleUser?.verified_email) {
  //     throw new NotFoundException({
  //       code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
  //       message: 'Email not found',
  //     });
  //   }

  //   const email = googleUser.email;
  //   const user = await this.usersRepository.findOne({
  //     where: { email: email },
  //   });

  //   if (!user) {
  //     throw new NotFoundException({
  //       code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
  //       message: 'Email not found',
  //     });
  //   }

  //   return await firstValueFrom(this.authService.generateTokens(user));
  // }

  // async oauthLoginByAuth({
  //   id_token,
  //   access_token_oauth,
  // }: OauthLoginEmailDto): Promise<IUserToken> {
  //   const googleUser = await this.getGoogleUser({
  //     id_token,
  //     access_token: access_token_oauth,
  //   });
  //   if (!googleUser?.verified_email) {
  //     throw new NotFoundException({
  //       code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
  //       message: 'Email not found',
  //     });
  //   }

  //   const _email = googleUser.email;
  //   const user = await this.usersRepository.findOne({
  //     where: { email: _email },
  //   });

  //   if (!user) {
  //     throw new NotFoundException({
  //       code: EXCEPTION_CODE.USER.EMAIL_NOT_FOUND,
  //       message: 'Email not found',
  //     });
  //   }

  //   return await firstValueFrom(this.authService.generateTokens(user));
  // }

  // methods
  findAll(): Observable<User[]> {
    return from(
      this.usersRepository.find({
        relations: {
          // shop: true,
        },
        order: { created_at: 'DESC' },
      }),
    );
  }

  findAllByQuery(query: any, user: User): Observable<PageDto<User[]>> {
    const sortBy = query.sort_by || 'created_at';
    const order = query.sort || 'DESC';
    const page = query.page;
    const limit = query.limit;
    // const role = user.role;

    const options: any = {
      relations: {},
      order: { [sortBy]: order },
    };

    if (page && limit) {
      options['skip'] = (page - 1) * limit;
      options['take'] = limit;
    }

    options['where'] = {};

    return from(this.usersRepository.findAndCount(options)).pipe(
      map(([data, count]) => {
        const meta = getMeta(query, count, data.length);

        return {
          data: data,
          meta,
        };
      }),
    );
  }

  findById(id: string, include?: string): Observable<User | null> {
    if (!id) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.ID_NOT_FOUND,
        message: `ID is empty`,
      });
    }

    return from(
      this.usersRepository.findOne({
        where: { id: id },
        relations: {
          // shop: Boolean(include?.includes('shop')),
        },
      }),
    );
  }

  findByRole(role: ERole): Observable<User[]> {
    if (!role) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.ID_NOT_FOUND,
        message: `Role is empty`,
      });
    }

    return from(
      this.usersRepository.find({
        where: { role: role },
      }),
    );
  }

  private findUserByEmail(email: string): Observable<User | null> {
    return from(
      this.usersRepository.findOne({
        select: ['id', 'password'],
        where: { email: email },
      }),
    );
  }

  private validatePassword(
    password: string,
    storedPasswordHash: string,
  ): Observable<boolean> {
    return this.authService.comparePasswords(password, storedPasswordHash);
  }

  private mailExists(
    email: string,
    excludeEmail?: string,
  ): Observable<boolean> {
    if (email === excludeEmail) return of(false);

    return from(this.usersRepository.findOneBy({ email })).pipe(
      map((user: User) => !!user),
    );
  }
}
