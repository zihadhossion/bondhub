import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FlagsService } from './flags.service';
import { CreateFlagDto } from './dtos/create-flag.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Flags')
@Controller('flags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Flag content for moderation' })
  @ApiResponse({ status: 201, description: 'Content flagged for review' })
  @ApiResponse({ status: 409, description: 'Already flagged this content' })
  async create(@Body() dto: CreateFlagDto, @CurrentUser() user: UserEntity) {
    return this.flagsService.create(dto, user.id);
  }
}
