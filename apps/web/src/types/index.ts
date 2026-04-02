export type RoleEnum = 'user' | 'admin';
export type UserStatusEnum = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  displayName: string;
  bio?: string;
  profilePicture?: string;
  role: RoleEnum;
  status: UserStatusEnum;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  membersCount: number;
  postsCount: number;
  coverUrl?: string;
  isJoined?: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Pick<User, 'id' | 'displayName' | 'profilePicture'>;
  community: Pick<Community, 'id' | 'name' | 'slug' | 'category'>;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: Pick<User, 'id' | 'displayName' | 'profilePicture'>;
  postId: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Flag {
  id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  contentType: 'post' | 'comment';
  contentId: string;
  reportedBy: Pick<User, 'id' | 'displayName'>;
  createdAt: string;
}

export type NotificationTypeEnum = 'new_follower' | 'new_comment';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationTypeEnum;
  title: string;
  message: string;
  relatedUserId?: string | null;
  relatedPostId?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: RoleEnum | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// --- API request/response types ---

export interface LoginResponse {
  id: string;
  email: string;
  displayName: string;
  role: RoleEnum;
  status: UserStatusEnum;
  bio?: string;
  profilePicture?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  bio?: string;
  profilePicture?: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface CreatePostPayload {
  communityId: string;
  title: string;
  content: string;
}

export interface UpdatePostPayload {
  title?: string;
  content?: string;
}

export interface CreateCommentPayload {
  content: string;
}

export interface CreateFlagPayload {
  contentType: 'post' | 'comment';
  contentId: string;
  reason?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
