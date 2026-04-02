import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

interface ApiSwaggerOptions {
  operation: 'create' | 'getAll' | 'getOne' | 'update' | 'delete' | 'custom';
  resourceName: string;
  summary?: string;
  requestDto?: unknown;
  withPagination?: boolean;
  requiresAuth?: boolean;
  successStatus?: number;
  errors?: { status: number; description: string }[];
}

export function ApiSwagger(options: ApiSwaggerOptions) {
  const {
    operation,
    resourceName,
    summary,
    withPagination = false,
    requiresAuth = true,
    successStatus,
    errors = [],
  } = options;

  const summaryMap: Record<string, string> = {
    create: `Create a new ${resourceName}`,
    getAll: `Get all ${resourceName}s`,
    getOne: `Get ${resourceName} by ID`,
    update: `Update ${resourceName}`,
    delete: `Delete ${resourceName}`,
    custom: summary || `${resourceName} operation`,
  };

  const statusMap: Record<string, number> = {
    create: HttpStatus.CREATED,
    getAll: HttpStatus.OK,
    getOne: HttpStatus.OK,
    update: HttpStatus.OK,
    delete: HttpStatus.NO_CONTENT,
    custom: successStatus || HttpStatus.OK,
  };

  const decorators = [
    ApiOperation({ summary: summaryMap[operation] }),
    ApiResponse({
      status: statusMap[operation],
      description: 'Success',
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ...errors.map((e) => ApiResponse({ status: e.status, description: e.description })),
  ];

  if (requiresAuth) {
    decorators.push(ApiBearerAuth());
  }

  if (withPagination) {
    decorators.push(
      ApiQuery({ name: 'page', required: false, type: Number }),
      ApiQuery({ name: 'limit', required: false, type: Number }),
      ApiQuery({ name: 'sortBy', required: false, type: String }),
      ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] }),
      ApiQuery({ name: 'q', required: false, type: String }),
    );
  }

  return applyDecorators(...decorators);
}
