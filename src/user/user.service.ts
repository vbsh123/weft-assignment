import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserStatusDto, UserStatus } from './user.dto';
import { Group } from 'src/group/group.entity';
import { GroupStatus } from 'src/group/group.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async createUser(
    name: string,
    email: string,
    status: UserStatus,
  ): Promise<User> {
    return await this.userRepository.save({ name, email, status });
  }

  async getAllUsers(limit: number, offset: number): Promise<User[]> {
    return await this.userRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async getUsersByName(name: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { name },
    });
  }

  async getUsersByEmail(email: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { email },
    });
  }

  // To further improve scale, it is also possible to wait for requests to arrive within a certain time window
  // and then sending them once as a batch
  // Also, it is possible to load up a small PubSub with Redis and Nestjs, which can further improve the scalability
  // I thought that both solutions were out of scope, so I stuck with simply bulking the request with one query
  async updateUserStatuses(updates: UpdateUserStatusDto[]): Promise<void> {
    const caseStatement = this.buildUpdateUserStatusesCaseStatement(updates);

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ status: () => caseStatement })
      .whereInIds(updates.map((update) => update.id))
      .execute();
  }

  private buildUpdateUserStatusesCaseStatement(
    updates: UpdateUserStatusDto[],
  ): string {
    let caseStatement = 'CASE id ';
    updates.forEach((update) => {
      caseStatement += `WHEN ${update.id} THEN '${update.status}'::user_status_enum `;
    });
    caseStatement += 'END';
    return caseStatement;
  }

  async removeUserFromGroup(userId: number): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOne(User, {
        where: { id: userId },
        relations: ['group'],
      });

      if (!user || !user.group)
        throw new NotFoundException(
          'User not found or user does not belong to any group',
        );

      const groupId = user.group.id;

      await transactionalEntityManager
        .createQueryBuilder()
        .relation(User, 'group')
        .of(userId)
        .set(null);

      const usersCount = await transactionalEntityManager
        .createQueryBuilder(User, 'user')
        .innerJoin('user.group', 'group', 'group.id = :groupId', { groupId })
        .getCount();

      if (usersCount === 0) {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Group)
          .set({
            status: GroupStatus.EMPTY,
          })
          .where('id = :groupId', { groupId })
          .execute();
      }
    });
  }
}
