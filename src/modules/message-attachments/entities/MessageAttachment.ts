import { Message } from '@/modules/messages/entities/message.entity';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'message_attachments' })
export class MessageAttachment {
  @PrimaryGeneratedColumn('uuid')
  key: string;

  // @ManyToOne(() => Message, (message) => message.attachments, {
  //   onDelete: 'CASCADE',
  // })
  message: Message;
}
