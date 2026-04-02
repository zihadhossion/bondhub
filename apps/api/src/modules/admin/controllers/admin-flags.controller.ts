import {
  Controller,
  Get,
  Post,
  Patch,
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
import { FlagStatusEnum } from '../../../shared/enums/flag-status.enum';
import { AdminBulkFlagActionDto } from '../dtos/admin-flag.dto';

@ApiTags('Admin Flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.admin)
@Controller('admin/flags')
export class AdminFlagsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List all flags' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: FlagStatusEnum })
  getFlags(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: FlagStatusEnum,
  ) {
    return this.adminService.getFlags(+page, +limit, status);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk action on flags (delete_content/dismiss/suspend_user)' })
  bulkAction(@Body() dto: AdminBulkFlagActionDto) {
    return this.adminService.bulkFlagAction(dto.action, dto.ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flag by ID' })
  getFlagById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getFlagById(id);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve flag (deletes flagged content)' })
  resolveFlag(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.resolveFlag(id);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss flag' })
  dismissFlag(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.dismissFlag(id);
  }
}
