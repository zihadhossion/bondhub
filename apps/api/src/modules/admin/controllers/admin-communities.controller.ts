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
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CommunityStatusEnum } from '../../../shared/enums/community-status.enum';
import {
  AdminUpdateCommunityStatusDto,
  AdminBulkCommunityActionDto,
} from '../dtos/admin-community.dto';
import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminCreateCommunityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;
}

export class AdminUpdateCommunityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;
}

@ApiTags('Admin Communities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.admin)
@Controller('admin/communities')
export class AdminCommunitiesController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List all communities with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: CommunityStatusEnum })
  getCommunities(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('status') status?: CommunityStatusEnum,
  ) {
    return this.adminService.getCommunities(+page, +limit, search, status);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new community' })
  createCommunity(@Body() dto: AdminCreateCommunityDto) {
    return this.adminService.createCommunity(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk action on communities (delete/archive/activate)' })
  bulkAction(@Body() dto: AdminBulkCommunityActionDto) {
    return this.adminService.bulkCommunityAction(dto.action, dto.ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get community by ID' })
  getCommunityById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getCommunityById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update community details' })
  updateCommunity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateCommunityDto,
  ) {
    return this.adminService.updateCommunity(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update community status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateCommunityStatusDto,
  ) {
    return this.adminService.updateCommunityStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete community (soft delete)' })
  deleteCommunity(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCommunity(id);
  }
}
