import {
  Controller,
  Query,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import {
  CreateUserDto,
  FilterEmailDto,
  FilterNameDto,
  PaginationDto,
  UpdateUserStatusesDto,
} from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { name, email, status } = createUserDto;
    return await this.userService.createUser(name, email, status);
  }

  @Get()
  async getAllUsers(@Query() pagination: PaginationDto) {
    return this.userService.getAllUsers(pagination.limit, pagination.offset);
  }

  @Get('filter/email')
  async getUsersByEmail(@Query() filter: FilterEmailDto) {
    return this.userService.getUsersByEmail(filter.email);
  }

  @Get('filter/name')
  async getUsersByName(@Query() filter: FilterNameDto) {
    return this.userService.getUsersByName(filter.name);
  }

  @Patch('statuses')
  async updateUserStatuses(@Body() updateStatusesDto: UpdateUserStatusesDto) {
    this.userService.updateUserStatuses(updateStatusesDto.updates);
    return { success: true };
  }

  @Patch('remove-from-group/:id')
  async removeUserFromGroup(@Param('id', ParseIntPipe) userId: number) {
    await this.userService.removeUserFromGroup(userId);
    return { success: true };
  }
}
