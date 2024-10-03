import { ISession } from 'connect-typeorm';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  // ObjectId,
  // ObjectIdColumn,
  // CreateDateColumn,
  // UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'sessions' })
export class Session implements ISession {
  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  // @ObjectIdColumn()
  // _id: ObjectId; // remove ?

  @Column('text')
  json: string;

  @Index()
  @Column()
  expiredAt: number = Date.now();

  @DeleteDateColumn()
  destroyedAt: Date;

  // @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // created_at: Date; // remove ?

  // @UpdateDateColumn({
  //   type: 'timestamp',
  //   onUpdate: 'CURRENT_TIMESTAMP',
  //   nullable: true,
  // })
  // updated_at: Date; // remove ?
}
