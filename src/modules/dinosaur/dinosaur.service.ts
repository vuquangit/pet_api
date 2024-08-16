import {
  Injectable,
  NotFoundException,
  // ConflictException,
  BadRequestException,
  // forwardRef,
  // Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

// dtos
import { CreateDinosaurDto } from '@/modules/dinosaur/dtos/CreateDinosaur.dto';
import { PageDto } from '@/common/dtos/page.dto';

// services
import { Dinosaur } from '@/modules/dinosaur/entity/dinosaur.entity';
import { UsersService } from '@/modules/users/users.service';

// others
import { EXCEPTION_CODE } from '@/constants/exceptionCode';
import { getMeta, takeByTop } from '@/utils/pagination';
import { UpdateResult } from '@/common/interfaces/common.interface';

@Injectable()
export class DinosaurService {
  constructor(
    @InjectRepository(Dinosaur)
    private readonly dinosaurRepository: Repository<Dinosaur>,
    private readonly userService: UsersService,
  ) {}

  // methods
  async findAll(query: any): Promise<PageDto<Dinosaur[]>> {
    const sortBy = query.sort_by || 'created_at';
    const order = query.sort || 'DESC';
    const page = +query.page;
    const limit = +query.limit;
    const top = +query.top;

    const options: any = {
      relations: {},
      order: { [sortBy]: order },
    };
    if (page && limit) {
      options['skip'] = (page - 1) * limit;
      options['take'] = limit;
    }
    options['where'] = {};

    // get top dinosaur
    if (top && takeByTop(page, limit, top) > 0) {
      options['order'] = { score: 'DESC' };
      options['skip'] = (page - 1) * limit;
      options['take'] = takeByTop(page, limit, top);
    } else if (top) {
      // return empty
      return {
        data: [],
        meta: {
          currentPage: page,
          from: 0,
          to: 0,
          perPage: limit,
          lastPage: Math.ceil(top / query.limit),
          total: top,
        },
      };
    }

    const [data, count] = await this.dinosaurRepository.findAndCount(options);
    const dataLength = data.length;
    const dataCount = top && top < count ? top : count;
    const meta = getMeta(query, dataCount, dataLength);

    const dateFull = await Promise.all(
      data.map(async (item) => {
        // get new user data if exist user
        const user = await this.userService.findById(item.userId);
        if (user) item.user = user;

        return item;
      }),
    );

    return {
      data: dateFull,
      meta,
    };
  }

  async create(createDto: CreateDinosaurDto): Promise<Dinosaur> {
    if (!ObjectId.isValid(createDto.userId)) {
      throw new BadRequestException({
        code: EXCEPTION_CODE.DINOSAUR.ID_NOT_FOUND,
        message: `A user id "${createDto.userId}" not correct ObjectId format`,
      });
    }

    const user = await this.userService.findById(createDto.userId);
    if (!user) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.DINOSAUR.ID_NOT_FOUND,
        message: `A user id "${createDto.userId}" was not found`,
      });
    }

    return await this.dinosaurRepository.save({ ...createDto, user });
  }

  async findById(id: string): Promise<Dinosaur> {
    if (!id) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.DINOSAUR.ID_NOT_FOUND,
        message: `ID is empty`,
      });
    }

    const data = await this.dinosaurRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!data) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.DINOSAUR.ID_NOT_FOUND,
        message: `ID not found`,
      });
    }

    const user = await this.userService.findById(data.userId);
    data.user = user;

    return data;
  }

  async remove(id: string): Promise<UpdateResult> {
    const deleteResult = await this.dinosaurRepository.delete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException({
        code: EXCEPTION_CODE.DINOSAUR.ID_NOT_FOUND,
        message: `A user id "${id}" was not found`,
      });
    }

    return { success: true };
  }
}
