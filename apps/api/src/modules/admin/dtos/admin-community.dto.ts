import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { CommunityStatusEnum } from '../../../shared/enums/community-status.enum';

export class AdminUpdateCommunityStatusDto {
  @ApiProperty({ enum: CommunityStatusEnum })
  @IsEnum(CommunityStatusEnum)
  @IsNotEmpty()
  status: CommunityStatusEnum;
}

export class AdminBulkCommunityActionDto {
  @ApiProperty({ enum: ['delete', 'archive', 'activate'] })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
