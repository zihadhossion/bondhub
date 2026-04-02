import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AdminBulkFlagActionDto {
  @ApiProperty({ enum: ['delete_content', 'dismiss', 'suspend_user'] })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
