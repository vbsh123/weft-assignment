import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

export class FilterNameDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  name: string;
}

export class FilterEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(250)
  email: string;
}

export class PaginationDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform((data) => parseInt(data.value))
  limit: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform((data) => parseInt(data.value))
  offset: number;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  email: string;

  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserStatusesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateUserStatusDto)
  updates: UpdateUserStatusDto[];
}
