import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { BaseMessage } from '../../../utils/typeorm/entities/BaseMessage';
import { Group } from './Group';
// import { GroupMessageAttachment } from './GroupMessageAttachment';
// import { MessageAttachment } from '../../../utils/typeorm/entities/MessageAttachment';
import { User } from '@/modules/users/entity/user.entity';

@Entity({ name: 'group_messages' })
export class GroupMessage {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ nullable: true })
  content: string;

  @Column()
  author_id: string;

  @Column({ nullable: true })
  author: User | null;

  // @ManyToOne(() => Group, (group) => group.messages)
  // group: Group;
  @Column()
  group_id: string;

  @Column({ nullable: true })
  group: Group;

  // // @OneToMany(() => GroupMessageAttachment, (attachment) => attachment.message)
  // // @JoinColumn()
  // // attachments?: MessageAttachment[];
  // @Column()
  // attachments_ids: string;

  // @Column({ nullable: true })
  // attachments: MessageAttachment;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;
}
