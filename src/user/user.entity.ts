import { Group } from '../group/group.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatus } from './user.dto';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'varchar', length: 250 })
  email: string;

  @Column({ type: 'enum', enum: UserStatus })
  status: string;

  @ManyToOne(() => Group, (group) => group.users)
  group: Group;
}
