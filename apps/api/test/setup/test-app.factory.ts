import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { UserEntity } from '../../src/modules/users/entities/user.entity';
import { CategoryEntity } from '../../src/modules/categories/entities/category.entity';
import { CommunityEntity } from '../../src/modules/communities/entities/community.entity';
import { CommunityMemberEntity } from '../../src/modules/communities/entities/community-member.entity';
import { PostEntity } from '../../src/modules/posts/entities/post.entity';
import { CommentEntity } from '../../src/modules/comments/entities/comment.entity';
import { FollowEntity } from '../../src/modules/users/entities/follow.entity';
import { FlagEntity } from '../../src/modules/flags/entities/flag.entity';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { CategoriesModule } from '../../src/modules/categories/categories.module';
import { CommunitiesModule } from '../../src/modules/communities/communities.module';
import { PostsModule } from '../../src/modules/posts/posts.module';
import { CommentsModule } from '../../src/modules/comments/comments.module';
import { FlagsModule } from '../../src/modules/flags/flags.module';
import { AdminModule } from '../../src/modules/admin/admin.module';
import { JwtAuthGuard } from '../../src/core/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/core/guards/roles.guard';
import { TransformInterceptor } from '../../src/core/interceptors/transform.interceptor';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          type: 'postgres',
          url: config.get<string>('DATABASE_URL') || process.env.DATABASE_URL,
          entities: [
            UserEntity,
            CategoryEntity,
            CommunityEntity,
            CommunityMemberEntity,
            PostEntity,
            CommentEntity,
            FollowEntity,
            FlagEntity,
          ],
          synchronize: true,
          dropSchema: false,
          logging: false,
        }),
      }),
      AuthModule,
      UsersModule,
      CategoriesModule,
      CommunitiesModule,
      PostsModule,
      CommentsModule,
      FlagsModule,
      AdminModule,
    ],
    providers: [
      { provide: APP_GUARD, useClass: JwtAuthGuard },
      { provide: APP_GUARD, useClass: RolesGuard },
      { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}
