import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserStatusEnum } from '../../../shared/enums/user-status.enum';
import { RoleEnum } from '../../../shared/enums/role.enum';

export class AdminCreateUserDto {
  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'TempP@ss1' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'password must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  password: string;

  @ApiProperty({ example: 'New User' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  displayName: string;

  @ApiPropertyOptional({ enum: RoleEnum, default: RoleEnum.user })
  @IsEnum(RoleEnum)
  @IsOptional()
  role?: RoleEnum;
}

export class AdminUpdateUserStatusDto {
  @ApiProperty({ enum: UserStatusEnum })
  @IsEnum(UserStatusEnum)
  @IsNotEmpty()
  status: UserStatusEnum;
}

export class AdminResetUserPasswordDto {
  @ApiProperty({ example: 'ResetP@ss1' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'newPassword must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  newPassword: string;
}

export class AdminBulkUserActionDto {
  @ApiProperty({ enum: ['delete', 'suspend', 'activate'] })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
