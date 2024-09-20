import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

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
import { UpdateResult } from '@/common/interfaces/common.interface';
import { UserNotFoundException } from './exceptions/UserNotFound';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(forwardRef(() => AuthService)) private authService: AuthService,

    private mailService: MailingService,
    // private uploadService: UploadService,
  ) {}

  // USERS
  async create(createdUserDto: CreateUserDto): Promise<any> {
    const isExist = await this.mailExists(createdUserDto.email);

    // mail exists
    if (isExist) {
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

    const passwordHash = await this.authService.hashPassword(passwordUser);

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

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const user: User = { ...restUserDto, avatar_url };
      return await this.saveUser(user);

      // return this.uploadService.uploadImage(createdUserDto.avatar).pipe(
      //   switchMap((data: any) => {
      //     createdUserDto.avatar_url = data.image_url;
      //     delete createdUserDto.avatar;
      //     return this.saveUser(createdUserDto, passwordUser);
      //   }),
      // );
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await this.saveUser(createdUserDto as User);
    }
  }

  private async saveUser(createdUserDto: User): Promise<User> {
    const newUser = this.usersRepository.create(createdUserDto);
    const savedUser = await this.usersRepository.save(newUser);

    // send mail
    // TODO: check mail send is success
    await this.mailService.createdUser(savedUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = savedUser;
    return user as User;
  }

  async update(
    id: string,
    updateUserDto: CreateUserDto,
  ): Promise<UpdateResult> {
    const userFound = await this.usersRepository.findOneBy({
      _id: new ObjectId(id),
    });

    if (!userFound) {
      throw new UserNotFoundException(id);
    }

    const isExist = await this.mailExists(updateUserDto.email, userFound.email);

    if (isExist) {
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

    const updateResult = await this.usersRepository.update(
      id,
      restUser as User,
    );

    if (!updateResult.affected) {
      throw new UserNotFoundException(id);
    }

    return { success: true };

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
  }

  async remove(id: string): Promise<UpdateResult> {
    // TODO: delete avatar

    const deleteResult = await this.usersRepository.delete(id);

    if (!deleteResult.affected) {
      throw new UserNotFoundException(id);
    }

    return { success: true };
  }

  async updatePassword(userData: User): Promise<boolean> {
    const userId = userData._id.toString();

    await this.usersRepository.update(userId, userData);

    const userFound = await this.findById(userId);
    if (!userFound) {
      throw new UserNotFoundException();
    }
    await this.mailService.sendNotiChangedPassword(userFound.email);

    return true;
  }

  async updateResetToken(
    userId: string,
    resetToken: string,
    resetTokenExpiry: Date,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      user.reset_token = resetToken;
      user.reset_token_expiry = resetTokenExpiry; // 1 hour from now
      await this.usersRepository.update(user._id, user);
    } else {
      throw new Error('User not found');
    }
  }

  searchUsers(query: string) {
    // const statement = '(user.username LIKE :query)';
    // return this.usersRepository
    //   .createQueryBuilder('user')
    //   .where(statement, { query: `%${query}%` })
    //   .limit(10)
    //   .select([
    //     'user.username',
    //     'user.firstName',
    //     'user.lastName',
    //     'user.email',
    //     'user.id',
    //     'user.profile',
    //   ])
    //   .getMany();

    console.log('searchUsers: ', query);

    const userFound = this.usersRepository.find({
      where: {
        // name: /query/,
        _id: new ObjectId(query),
      },
    });

    if (!userFound) throw new UserNotFoundException();

    return userFound;
  }

  // methods
  async findAll(query: any): Promise<PageDto<User[]>> {
    const sortBy = query.sort_by || 'created_at';
    const order = query.sort || 'DESC';
    const page = +query.page;
    const limit = +query.limit;
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

    const [data, count] = await this.usersRepository.findAndCount(options);
    const meta = getMeta(query, count, data.length);

    return {
      data: data,
      meta,
    };
  }

  async findById(id: string): Promise<User | null> {
    if (!id) {
      throw new UserNotFoundException();
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.usersRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    return user as User;
  }

  async findByRole(role: ERole): Promise<User[]> {
    if (!role) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.USER.ROLE_INVALID,
        message: `Role is empty`,
      });
    }

    return await this.usersRepository.find({
      where: { role: role },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      select: [
        '_id',
        'password',
        'email',
        'role',
        'reset_token',
        'reset_token_expiry',
      ],
      where: { email: email },
    });
  }

  private async mailExists(
    email: string,
    excludeEmail?: string,
  ): Promise<boolean> {
    if (email === excludeEmail) return false;

    return !!(await this.usersRepository.findOneBy({ email }));
  }
}
