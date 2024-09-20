import {
  Inject,
  Injectable,
  NestMiddleware,
  // HttpException,
  // HttpStatus,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { Services } from '@/constants/constants';
import { AuthenticatedRequest } from '@/utils/types';
import { IConversationsService } from '../conversations';
import { ConversationNotFoundException } from '../exceptions/ConversationNotFound';
import { InvalidConversationIdException } from '../exceptions/InvalidConversationId';

@Injectable()
export class ConversationMiddleware implements NestMiddleware {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationService: IConversationsService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const user = req.user;
    const userId = user._id.toString();
    const id = req.params.id;
    if (!id) throw new InvalidConversationIdException();

    const isReadable = await this.conversationService.hasAccess({ id, userId });
    console.log(isReadable);

    if (isReadable) next();
    else throw new ConversationNotFoundException();
  }
}
