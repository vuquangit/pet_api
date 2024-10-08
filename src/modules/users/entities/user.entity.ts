import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsDate } from 'class-validator';

import { ERole } from '@/modules/users/enums/role.enum';
import { Peer } from './peer.entit';
import { UserPresence } from './UserPresence';

@Entity({ name: 'users' })
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    type: 'enum',
    enum: ERole,
    default: ERole.USER,
  })
  role: ERole;

  @Column()
  name: string;

  @Column({ nullable: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  avatar_public_id?: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  @IsDate()
  birthday: Date;

  @Column()
  is_active: boolean;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  peer_id: string;

  @Column({ nullable: true })
  peer: Peer | null;

  @Column({ nullable: true })
  presence_id: string;

  @Column({ nullable: true })
  presence: UserPresence | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;

  @Column({ nullable: true, select: false })
  reset_token: string;

  @Column({ nullable: true, type: 'timestamp', select: false })
  reset_token_expiry: Date;
}
