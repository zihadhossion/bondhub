/**
 * BondHub Seed Script
 * Uses TypeORM DataSource internally.
 * Reads credentials from .claude-project/user_stories/_fixtures.yaml (Single Source of Truth)
 */
import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UserEntity } from '../src/modules/users/entities/user.entity';
import { CategoryEntity } from '../src/modules/categories/entities/category.entity';
import { CommunityEntity } from '../src/modules/communities/entities/community.entity';
import { CommunityMemberEntity } from '../src/modules/communities/entities/community-member.entity';
import { PostEntity } from '../src/modules/posts/entities/post.entity';
import { CommentEntity } from '../src/modules/comments/entities/comment.entity';
import { FollowEntity } from '../src/modules/users/entities/follow.entity';
import { FlagEntity } from '../src/modules/flags/entities/flag.entity';
import { RoleEnum } from '../src/shared/enums/role.enum';
import { UserStatusEnum } from '../src/shared/enums/user-status.enum';
import { CommunityStatusEnum } from '../src/shared/enums/community-status.enum';

interface FixtureUser {
  email: string;
  password: string;
  role: 'user' | 'admin';
  displayName: string;
  bio?: string;
}

interface FixtureCategory {
  name: string;
}

interface FixtureCommunity {
  name: string;
  category: string;
  description?: string;
}

interface FixturePost {
  title: string;
  content: string;
  author: string;
  community: string;
}

interface FixtureComment {
  content: string;
  author: string;
  post: string;
}

interface FixtureFollow {
  follower: string;
  following: string;
}

interface FixtureMember {
  user: string;
  community: string;
}

interface Fixtures {
  users: FixtureUser[];
  categories: FixtureCategory[];
  communities: FixtureCommunity[];
  posts: FixturePost[];
  comments: FixtureComment[];
  follows: FixtureFollow[];
  community_members: FixtureMember[];
}

async function seed() {
  const fixturesPath = path.resolve(__dirname, '../../.claude-project/user_stories/_fixtures.yaml');
  const raw = fs.readFileSync(fixturesPath, 'utf8');
  const fixtures = yaml.load(raw) as Fixtures;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
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
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  console.log('Database connected. Starting seed...');

  const userRepo = dataSource.getRepository(UserEntity);
  const categoryRepo = dataSource.getRepository(CategoryEntity);
  const communityRepo = dataSource.getRepository(CommunityEntity);
  const memberRepo = dataSource.getRepository(CommunityMemberEntity);
  const postRepo = dataSource.getRepository(PostEntity);
  const commentRepo = dataSource.getRepository(CommentEntity);
  const followRepo = dataSource.getRepository(FollowEntity);

  // ── Users ────────────────────────────────────────────────────────────────
  const userMap = new Map<string, UserEntity>();
  for (const u of fixtures.users) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    if (!user) {
      const hash = await bcrypt.hash(u.password, 10);
      user = userRepo.create({
        email: u.email,
        password: hash,
        displayName: u.displayName,
        bio: u.bio ?? null,
        role: u.role === 'admin' ? RoleEnum.admin : RoleEnum.user,
        status: UserStatusEnum.active,
      });
      user = await userRepo.save(user);
      console.log(`  Created user: ${u.email}`);
    } else {
      console.log(`  Skipped user (exists): ${u.email}`);
    }
    userMap.set(u.email, user);
  }

  // ── Categories ────────────────────────────────────────────────────────────
  const categoryMap = new Map<string, CategoryEntity>();
  for (const c of fixtures.categories) {
    let category = await categoryRepo.findOne({ where: { name: c.name } });
    if (!category) {
      category = categoryRepo.create({ name: c.name });
      category = await categoryRepo.save(category);
      console.log(`  Created category: ${c.name}`);
    } else {
      console.log(`  Skipped category (exists): ${c.name}`);
    }
    categoryMap.set(c.name, category);
  }

  // ── Communities ───────────────────────────────────────────────────────────
  const communityMap = new Map<string, CommunityEntity>();
  for (const c of fixtures.communities) {
    let community = await communityRepo.findOne({ where: { name: c.name } });
    if (!community) {
      const category = categoryMap.get(c.category);
      if (!category) throw new Error(`Category not found: ${c.category}`);
      community = communityRepo.create({
        name: c.name,
        description: c.description ?? null,
        categoryId: category.id,
        status: CommunityStatusEnum.active,
      });
      community = await communityRepo.save(community);
      console.log(`  Created community: ${c.name}`);
    } else {
      console.log(`  Skipped community (exists): ${c.name}`);
    }
    communityMap.set(c.name, community);
  }

  // ── Community Members ─────────────────────────────────────────────────────
  for (const m of fixtures.community_members) {
    const user = userMap.get(m.user);
    const community = communityMap.get(m.community);
    if (!user || !community) continue;
    const existing = await memberRepo.findOne({
      where: { userId: user.id, communityId: community.id },
    });
    if (!existing) {
      const member = memberRepo.create({ userId: user.id, communityId: community.id });
      await memberRepo.save(member);
      console.log(`  Added member ${m.user} → ${m.community}`);
    }
  }

  // ── Posts ─────────────────────────────────────────────────────────────────
  const postMap = new Map<string, PostEntity>();
  for (const p of fixtures.posts) {
    let post = await postRepo.findOne({ where: { title: p.title } });
    if (!post) {
      const author = userMap.get(p.author);
      const community = communityMap.get(p.community);
      if (!author || !community) continue;
      post = postRepo.create({
        title: p.title,
        content: p.content,
        authorId: author.id,
        communityId: community.id,
      });
      post = await postRepo.save(post);
      console.log(`  Created post: ${p.title}`);
    } else {
      console.log(`  Skipped post (exists): ${p.title}`);
    }
    postMap.set(p.title, post);
  }

  // ── Comments ──────────────────────────────────────────────────────────────
  for (const c of fixtures.comments) {
    const author = userMap.get(c.author);
    const post = postMap.get(c.post);
    if (!author || !post) continue;
    const existing = await commentRepo.findOne({
      where: { content: c.content, authorId: author.id, postId: post.id },
    });
    if (!existing) {
      const comment = commentRepo.create({
        content: c.content,
        authorId: author.id,
        postId: post.id,
      });
      await commentRepo.save(comment);
      console.log(`  Created comment by ${c.author} on "${c.post}"`);
    }
  }

  // ── Follows ───────────────────────────────────────────────────────────────
  for (const f of fixtures.follows) {
    const follower = userMap.get(f.follower);
    const following = userMap.get(f.following);
    if (!follower || !following) continue;
    const existing = await followRepo.findOne({
      where: { followerId: follower.id, followingId: following.id },
    });
    if (!existing) {
      const follow = followRepo.create({
        followerId: follower.id,
        followingId: following.id,
      });
      await followRepo.save(follow);
      console.log(`  ${f.follower} now follows ${f.following}`);
    }
  }

  await dataSource.destroy();
  console.log('\nSeed completed successfully!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
