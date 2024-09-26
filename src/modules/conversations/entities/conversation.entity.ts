import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Message } from '@/modules/messages/entities/message.entity';

@Entity({ name: 'conversations' })
export class Conversation {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  creator_id: string;

  @Column({ nullable: true })
  creator: User | null;

  @Column()
  recipient_id: string;

  @Column({ nullable: true })
  recipient: User | null;

  @Column()
  messages_ids: Array<string>; // TODO: check type

  @Column({ nullable: true })
  messages: Message[];

  @Column({ nullable: true })
  lastMessageSent_id: string | null;

  @Column({ nullable: true })
  lastMessageSent: Message | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;
}
