import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
// import { HttpService } from '@nestjs/axios';

// dtos
import { CreateUserDto } from '@/modules/users/dtos/CreateUser.dto';
import { PageDto } from '@/common/dtos/page.dto';

// services
import { AuthService } from '@/modules/auth/auth.service';
import { User } from '@/modules/users/entity/user.entity';
import { MailingService } from '@/modules/mailing/mailing.service';
// import { UploadService } from '@/modules/upload/upload.service';

// others
import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { ERole } from './enums/role.enum';
import { getMeta } from '@/utils/pagination';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(forwardRef(() => AuthService)) private authService: AuthService,

    // private httpService: HttpService,
    private mailService: MailingService,
    // private uploadService: UploadService,
  ) {}

  // USERS
  create(createdUserDto: CreateUserDto): Observable<any> {
    return this.mailExists(createdUserDto.email).pipe(
      switchMap((exists: boolean) => {
        // mail exists
        if (exists) {
          throw new ConflictException({
            code: EXCEPTION_CODE.USER.EMAIL_EXIST,
            message: 'Email already in use',
          });
        }

        // role invalid
        if (!ERole[createdUserDto.role]) {
          throw new BadRequestException({
            code: EXCEPTION_CODE.USER.ROLE_INVALID,
            message: 'Role is invalid',
          });
        }

        const passwordUser =
          createdUserDto.password || this.authService.randomPassword();

        return this.authService.hashPassword(passwordUser).pipe(
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
              return this.saveUser(user);

              // return this.uploadService.uploadImage(createdUserDto.avatar).pipe(
              //   switchMap((data: any) => {
              //     createdUserDto.avatar_url = data.image_url;
              //     delete createdUserDto.avatar;
              //     return this.saveUser(createdUserDto, passwordUser);
              //   }),
              // );
            } else {
              return this.saveUser(createdUserDto as User);
            }
          }),
        );
      }),
    );
  }

  private saveUser(createdUserDto: User) {
    const newUser = this.usersRepository.create(createdUserDto);

    // send mail
    return from(this.usersRepository.save(newUser)).pipe(
      map((savedUser: User) => {
        // send mail
        // TODO: check mail send is success
        this.mailService.createdUser(savedUser);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...user } = savedUser;
        return user;
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

  updatePassword(userData: User): Observable<any> {
    const userId = userData.id;

    return from(this.usersRepository.update(userId, userData)).pipe(
      switchMap((): any => {
        return this.findById(userId).pipe(
          map((userById: User) => {
            this.mailService.sendNotiChangedPassword(userById.email);

            return true;
          }),
        );
      }),
    );
  }

  // methods
  findAll(query: any): Observable<PageDto<User[]>> {
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

  findById(id: string): Observable<User | null> {
    if (!id) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.ID_NOT_FOUND,
        message: `ID is empty`,
      });
    }

    return from(
      this.usersRepository.findOne({
        where: { id: id },
        // relations: {},
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

  findUserByEmail(email: string): Observable<User | null> {
    return from(
      this.usersRepository.findOne({
        select: ['id', 'password'],
        where: { email: email },
      }),
    );
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
