import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupMessage } from './GroupMessage';
import { User } from '@/modules/users/entities/user.entity';

@Entity({ name: 'groups' })
export class Group {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ nullable: true })
  title?: string;

  @Column()
  user_ids: string[];

  @Column({ nullable: true })
  users: User[];

  @Column()
  creator_id: string;

  @Column({ nullable: true })
  creator: User;

  @Column()
  owner_id: string;

  @Column({ nullable: true })
  owner: User;

  @Column()
  messages_ids: string[]; // TODO: check type

  @Column({ nullable: true })
  messages: GroupMessage[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;

  @Column({ nullable: true })
  lastMessageSent_id: string | null;

  @Column({ nullable: true })
  lastMessageSent: GroupMessage | null;

  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  lastMessageSentAt: Date;

  @Column({ nullable: true })
  avatar?: string;
}
