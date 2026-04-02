import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserEntity } from './modules/users/entities/user.entity';
import { CategoryEntity } from './modules/categories/entities/category.entity';
import { CommunityEntity } from './modules/communities/entities/community.entity';
import { CommunityMemberEntity } from './modules/communities/entities/community-member.entity';
import { PostEntity } from './modules/posts/entities/post.entity';
import { PostLikeEntity } from './modules/posts/entities/post-like.entity';
import { CommentEntity } from './modules/comments/entities/comment.entity';
import { FollowEntity } from './modules/users/entities/follow.entity';
import { FlagEntity } from './modules/flags/entities/flag.entity';
import { NotificationEntity } from './modules/notifications/entities/notification.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FlagsModule } from './modules/flags/flags.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [
          UserEntity,
          CategoryEntity,
          CommunityEntity,
          CommunityMemberEntity,
          PostEntity,
          PostLikeEntity,
          CommentEntity,
          FollowEntity,
          FlagEntity,
          NotificationEntity,
        ],
        migrations: ['dist/database/migrations/*.js'],
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    CategoriesModule,
    CommunitiesModule,
    PostsModule,
    CommentsModule,
    FlagsModule,
    AdminModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
