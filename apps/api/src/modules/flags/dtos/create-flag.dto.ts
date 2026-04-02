import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ContentTypeEnum } from '../../../shared/enums/content-type.enum';

export class CreateFlagDto {
  @ApiProperty({ enum: ContentTypeEnum, example: ContentTypeEnum.post })
  @IsEnum(ContentTypeEnum)
  @IsNotEmpty()
  contentType: ContentTypeEnum;

  @ApiProperty({ example: 'p1a2b3c4-d5e6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsNotEmpty()
  contentId: string;

  @ApiPropertyOptional({ example: 'Spam content' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
