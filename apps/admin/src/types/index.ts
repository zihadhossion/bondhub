export type RoleEnum = 'user' | 'admin';
export type UserStatusEnum = 'active' | 'suspended';
export type FlagStatus = 'pending' | 'resolved' | 'dismissed';
export type ContentType = 'post' | 'comment';

export interface User {
  id: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  role: RoleEnum;
  status: UserStatusEnum;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string | { id: string; name: string };
  status?: 'active' | 'archived';
  membersCount: number;
  postsCount: number;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  communityId: string;
  communityName: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  postId: string;
  postTitle: string;
  likesCount: number;
  createdAt: string;
}

export interface Flag {
  id: string;
  reason: string;
  status: FlagStatus;
  contentType: ContentType;
  contentId: string;
  reportedBy: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  communitiesCount: number;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// --- Admin API request/response types ---

export interface DashboardStats {
  users: { total: number; active: number; suspended: number; newToday: number };
  communities: { total: number; active: number };
  content: { posts: number; comments: number };
  moderation: { pendingFlags: number };
}

export interface ChartDataPoint {
  date: string;
  count: string;
}

export interface ChartData {
  period: string;
  userGrowth: ChartDataPoint[];
  postActivity: ChartDataPoint[];
  communityGrowth: ChartDataPoint[];
}

export type ActivityType = 'user_registered' | 'post_created' | 'content_flagged';

export interface RecentActivityItem {
  type: ActivityType;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface AdminUpdateUserStatusPayload {
  status: UserStatusEnum;
}

export interface AdminUpdateCommunityStatusPayload {
  status: 'active' | 'archived';
}

export interface AdminCreateCategoryPayload {
  name: string;
  description?: string;
}

export interface AdminUpdateCategoryPayload {
  name?: string;
  description?: string;
}

export interface AdminResolveFlagPayload {
  action: 'resolve' | 'dismiss';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type NotificationTypeEnum = 'new_follower' | 'new_comment';

export interface Notification {
  id: string;
  type: NotificationTypeEnum;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}
