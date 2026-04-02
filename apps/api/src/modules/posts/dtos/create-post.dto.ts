import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'c1d2e3f4-a5b6-7890-cdef-ab1234567890' })
  @IsUUID()
  @IsNotEmpty()
  communityId: string;

  @ApiProperty({ example: 'Golden Hour Photography Tips' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Here are some tips for capturing the perfect golden hour shot...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(300)
  content: string;
}
