import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get personalized feed' })
  @ApiResponse({ status: 200, description: 'Paginated feed posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(
    @CurrentUser() user: UserEntity,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.postsService.getFeed(user.id, +page, +limit);
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60 * 60 * 1000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created' })
  @ApiResponse({ status: 403, description: 'Not a community member' })
  async create(@Body() dto: CreatePostDto, @CurrentUser() user: UserEntity) {
    return this.postsService.create(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post detail' })
  @ApiResponse({ status: 200, description: 'Post details' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserEntity) {
    return this.postsService.findById(id, user.id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on a post' })
  @ApiResponse({ status: 200, description: 'Like toggled, returns liked state and count' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async toggleLike(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserEntity) {
    return this.postsService.toggleLike(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own post' })
  @ApiResponse({ status: 200, description: 'Updated post' })
  @ApiResponse({ status: 403, description: 'Not the post owner' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.postsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own post' })
  @ApiResponse({ status: 204, description: 'Post deleted' })
  @ApiResponse({ status: 403, description: 'Not the post owner' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserEntity) {
    await this.postsService.delete(id, user.id);
  }
}
