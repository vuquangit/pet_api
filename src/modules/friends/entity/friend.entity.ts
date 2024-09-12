import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/modules/users/entity/user.entity';

@Entity({ name: 'friends' })
export class Friend {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  sender_id: string;

  @Column({ nullable: true })
  sender: User | null;

  @Column()
  receiver_id: string;

  @Column({ nullable: true })
  receiver: User | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;
}
