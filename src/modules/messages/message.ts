import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessageParams,
  EditMessageParams,
} from './interfaces/message.interface';
import { Message } from './entities/message.entity';

export interface IMessageService {
  createMessage(params: CreateMessageParams): Promise<CreateMessageResponse>;
  getMessages(id: string): Promise<Message[]>;
  deleteMessage(params: DeleteMessageParams): any;
  editMessage(params: EditMessageParams): Promise<Message>;
}
