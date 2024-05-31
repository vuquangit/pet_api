import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  // JoinColumn,
  // ManyToOne,
  // OneToMany,
} from 'typeorm';
import { IsDate } from 'class-validator';

import { ERole } from '../enums/role.enum';
// import { Shop } from '@/modules/shop/entity/shop.entity';
// import { Notification } from '@/modules/notification/entity/noti.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  avatar_url: string;

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

  @Column({ type: 'date', nullable: true })
  @IsDate()
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  @IsDate()
  end_date: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
  updated_at: Date;

  @Column({ nullable: true, select: false })
  reset_token: string;

  @Column({ nullable: true, type: 'timestamp', select: false })
  reset_token_expiry: Date;

  // @Column({ name: 'shop_id' })
  // shop_id: string;

  // @ManyToOne(() => Shop, (shop) => shop.users)
  // @JoinColumn({
  //   name: 'shop_id',
  // })
  // shop: Shop;

  // @OneToMany(() => Notification, (noti) => noti.user)
  // notifications: Notification[];
}
