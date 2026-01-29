export interface User {
  id: number;
  username: string;
  email?: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  headerImageUrl?: string;
  isPrivate?: boolean;
  isVerified: boolean;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    followers: number;
    following: number;
    posts: number;
  };
}

export interface Trend {
  id: number;
  name: string;
  description?: string;
  hashtag: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  _count?: {
    posts: number;
  };
}

export interface Post {
  id: number;
  userId: number;
  trendId: number;
  postType: 'IMAGE' | 'VIDEO' | 'TEXT';
  caption?: string;
  textContent?: string;
  imageUrl?: string;
  videoUrl?: string;
  imageAltText?: string;
  videoDuration?: number;
  hideLikeCount: boolean;
  hideCommentCount: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  trend: Trend;
  _count?: {
    likes: number;
    comments?: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Comment {
  id: number;
  userId: number;
  postId: number;
  parentCommentId?: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  replies?: Comment[];
  _count?: {
    replies: number;
  };
}

export interface Story {
  id: number;
  userId: number;
  storyType: 'IMAGE' | 'VIDEO' | 'TEXT';
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: number;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  follower: User;
  following: User;
}

export interface TrendWinner {
  id: number;
  trendId: number;
  userId: number;
  postId: number;
  rankPosition: number;
  finalScore: number;
  awardedAt: Date;
  trend: Trend;
  user: User;
  post: Post;
}

export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content?: string;
  sharedPostId?: number;
  messageType: 'TEXT' | 'POST_SHARE';
  isRead: boolean;
  createdAt: Date;
  sender: User;
  recipient: User;
  sharedPost?: Post;
}

export interface LeaderboardEntry {
  userId: number;
  user: User;
  posts: Post[];
  score: number;
  rank: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchResults {
  users: User[];
  posts: Post[];
  trends: Trend[];
}

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  timePosted: Date;
  userFollowers: number;
}

export interface CreatePostData {
  caption?: string;
  trendId: number;
  imageFile: File;
}

export interface UpdateUserData {
  displayName?: string;
  bio?: string;
  isPrivate?: boolean;
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: number;
}

export interface ReportData {
  reportedUserId?: number;
  reportedPostId?: number;
  reportType: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'FAKE_ACCOUNT' | 'OTHER';
  description?: string;
}