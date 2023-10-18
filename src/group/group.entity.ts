import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { GroupStatus } from './group.dto';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: GroupStatus, default: GroupStatus.EMPTY })
  status: GroupStatus;

  @OneToMany(() => User, (user) => user.group)
  users: User[];
}
