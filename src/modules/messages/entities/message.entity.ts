import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/modules/users/entity/user.entity';
import { Conversation } from '@/modules/conversations/entities/conversation.entity';
// import { MessageAttachment } from '@/utils/typeorm';

@Entity({ name: 'messages' })
export class Message {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ nullable: true })
  content: string;

  @Column()
  author_id: string;

  @Column({ nullable: true })
  author: User | null;

  @Column()
  conversation_id: string;

  @Column({ nullable: true })
  conversation: Conversation;

  // @Column({ nullable: true })
  // attachments_id: string;

  // @Column({ nullable: true })
  // attachments: MessageAttachment | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;
}
