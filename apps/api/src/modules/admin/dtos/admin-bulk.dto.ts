import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AdminBulkActionDto {
  @ApiProperty({ example: 'delete' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
