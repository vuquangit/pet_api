import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

// dtos
import { CreateUserDto } from '@/modules/users/dtos/CreateUser.dto';
import { PageDto } from '@/common/dtos/page.dto';

// services
import { AuthService } from '@/modules/auth/auth.service';
import { User } from '@/modules/users/entities/user.entity';
import { MailingService } from '@/modules/mailing/mailing.service';
import { IImageStorageService } from '@/modules/image-storage/image-storage';

// others
import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { ERole } from '../enums/role.enum';
import { getMeta } from '@/utils/pagination';
import { UpdateResult } from '@/common/interfaces/common.interface';
import { UserNotFoundException } from '../exceptions/UserNotFound';
import { UserPresence } from '../entities/UserPresence';
import { Services } from '@/constants/constants';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';
import { UploadException } from '@/modules/image-storage/exceptions/UploadError';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
    @InjectRepository(UserPresence)
    private readonly userPresenceRepository: Repository<UserPresence>,

    private mailService: MailingService,
    @Inject(Services.IMAGE_UPLOAD_SERVICE)
    private readonly imageStorageService: IImageStorageService,
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

    // convert 'null' to null
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
      const dataUpload = await this.imageStorageService.upload(
        createdUserDto.avatar,
      );

      createdUserDto.avatar_url = dataUpload.url;
      createdUserDto.avatar_public_id = dataUpload.public_id;
    }

    return await this.saveUser(createdUserDto as unknown as User);
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
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult | undefined> {
    if (!id) throw new UserNotFoundException();

    const userFound = await this.usersRepository.findOne({
      where: {
        _id: new ObjectId(id),
      },
    });
    if (!userFound) throw new UserNotFoundException(id);

    if (updateUserDto.email && updateUserDto.email !== userFound.email) {
      const isExist = await this.mailExists(
        updateUserDto.email,
        userFound.email,
      );

      if (isExist) {
        throw new ConflictException({
          code: EXCEPTION_CODE.USER.EMAIL_EXIST,
          message: 'Email already in use',
        });
      }
    }

    ['birthday'].forEach((fieldDate: keyof CreateUserDto) => {
      if (updateUserDto[fieldDate] === 'null')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        updateUserDto[fieldDate] = null;
    });

    // upload avatar
    try {
      if (!updateUserDto.is_delete_avatar && updateUserDto.avatar) {
        const dataUpload = await this.imageStorageService.upload(
          updateUserDto.avatar,
        );

        // delete old image
        userFound.avatar_public_id &&
          (await this.imageStorageService.delete(userFound.avatar_public_id));

        updateUserDto.avatar_url = dataUpload.url;
        updateUserDto.avatar_public_id = dataUpload.public_id;
      } else if (updateUserDto.is_delete_avatar && updateUserDto.avatar_url) {
        this.imageStorageService.delete(updateUserDto.avatar_url);
        updateUserDto.avatar_url = null;
      }
    } catch (err) {
      console.log('Upload image error: ', err);
      throw new UploadException(err);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { avatar, is_delete_avatar, ...restUser } = updateUserDto;
    await this.usersRepository.update(id, restUser as unknown as User);

    return { success: true };
  }

  async remove(id: string): Promise<UpdateResult> {
    const userFound = await this.findById(id);
    await this.usersRepository.delete(id);

    // delete old image
    userFound?.avatar_public_id &&
      (await this.imageStorageService.delete(userFound.avatar_public_id));

    return { success: true };
  }

  async updatePassword(userData: User): Promise<boolean> {
    const userId = userData._id.toString();
    const userFound = await this.findById(userId);
    if (!userFound) {
      throw new UserNotFoundException();
    }

    await this.usersRepository.update(userId, userData);

    await this.mailService.sendNotiChangedPassword(userFound.email);

    return true;
  }

  async updateUser(userData: User): Promise<UpdateResult> {
    const userId = userData._id.toString();
    const userFound = await this.findById(userId);
    if (!userFound) throw new UserNotFoundException();

    await this.usersRepository.update(userId, userData);
    return { success: true };
  }

  async updateResetToken(
    userId: string,
    resetToken: string,
    resetTokenExpiry: Date,
  ): Promise<void> {
    const user = await this.findById(userId, [
      'reset_token',
      'reset_token_expiry',
    ]);
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

    const userFound = this.usersRepository.find({
      where: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        $or: [
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          { name: { $regex: query } },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          { username: { $regex: query } },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          { email: { $regex: query } },
        ],
      },
    });

    if (!userFound) throw new UserNotFoundException();

    return userFound;
  }

  createPresence(): Promise<UserPresence> {
    return this.userPresenceRepository.save(
      this.userPresenceRepository.create(),
    );
  }

  // methods
  async findAll(query: any): Promise<PageDto<User[]>> {
    const sortBy = query.sort_by || 'created_at';
    const order = query.sort || 'DESC';
    const page = +query.page;
    const limit = +query.limit;
    // const role = user.role;

    const options: any = {
      select: [
        '_id',
        'email',
        'role',
        'address',
        'birthday',
        'avatar_url',
        'phone',
        'is_active',
        'note',
      ], // TODO: get more if have
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

  async findById(
    id: string,
    fieldMore: (keyof User)[] = [],
  ): Promise<User | null> {
    if (!id) {
      throw new UserNotFoundException();
    }

    try {
      return await this.usersRepository.findOne({
        where: { _id: new ObjectId(id) },
        select: [
          '_id',
          'email',
          'role',
          'name',
          'username',
          'address',
          'birthday',
          'avatar_url',
          'phone',
          'is_active',
          'note',
          'created_at',
          'updated_at',
          ...fieldMore,
          // TODO: get more if have
        ],
      });
    } catch (error) {
      console.log('findById error:', error);
      throw new UserNotFoundException();
    }
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

  async findUserByEmail(
    email: string,
    isIncludePassword = false,
  ): Promise<User | null> {
    const userSelects = [
      '_id',
      'password',
      'email',
      'name',
      'role',
      'address',
      'birthday',
      'avatar_url',
      'phone',
      'is_active',
      'note',
    ].filter((s) => isIncludePassword || s !== 'password');

    return await this.usersRepository.findOne({
      select: userSelects as FindOptionsSelect<User>,
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
