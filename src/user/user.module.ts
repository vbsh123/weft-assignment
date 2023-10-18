import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../group/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Group])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
