import { ApiResponse, PaginatedResponse, User, Post, Trend, Comment, Message, Story, LeaderboardEntry, SearchResults, AuthResponse, TokenRefreshResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    // Only add Content-Type if not already set and not FormData
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle 401 unauthorized - try to refresh token
      if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
        const refreshResult = await this.refreshToken();
        if (refreshResult.success && refreshResult.data?.tokens) {
          // Update token and retry the original request
          this.setToken(refreshResult.data.tokens.accessToken);
          
          // Retry the original request with new token
          const retryHeaders: Record<string, string> = { ...headers };
          retryHeaders['Authorization'] = `Bearer ${refreshResult.data.tokens.accessToken}`;
          
          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });
          
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            return {
              success: false,
              error: retryData.error || 'An error occurred',
            };
          }
          
          return {
            success: true,
            data: retryData.data || retryData,
            message: retryData.message,
          };
        } else {
          // Refresh failed, clear tokens and redirect to login
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  async logout() {
    const result = await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
    return result;
  }

  async refreshToken(): Promise<ApiResponse<{ tokens: TokenRefreshResponse }>> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refreshToken') 
      : null;
    
    if (!refreshToken) {
      return { success: false, error: 'No refresh token' };
    }

    return this.request<{ tokens: TokenRefreshResponse }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User methods
  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  async getUserByUsername(username: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/username/${username}`);
  }

  async updateUser(id: number, data: any): Promise<ApiResponse<User>> {
    // Handle FormData for file uploads
    if (data instanceof FormData) {
      return this.request<User>(`/users/${id}`, {
        method: 'PUT',
        body: data,
        // Don't set Content-Type for FormData, let browser set it
        headers: {},
      });
    }
    
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async followUser(id: number) {
    return this.request(`/users/${id}/follow`, { method: 'POST' });
  }

  async unfollowUser(id: number) {
    return this.request(`/users/${id}/follow`, { method: 'DELETE' });
  }

  // Saved posts methods
  async getSavedPosts(userId: number): Promise<ApiResponse<Post[]>> {
    return this.request<Post[]>(`/users/${userId}/saved`);
  }

  async savePost(userId: number, postId: number) {
    return this.request(`/users/${userId}/saved`, {
      method: 'POST',
      body: JSON.stringify({ postId }),
    });
  }

  async unsavePost(userId: number, postId: number) {
    return this.request(`/users/${userId}/saved`, {
      method: 'DELETE',
      body: JSON.stringify({ postId }),
    });
  }

  // Blocked users methods
  async getBlockedUsers(userId: number): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(`/users/${userId}/blocked`);
  }

  async blockUser(userId: number, blockedUserId: number) {
    return this.request(`/users/${userId}/blocked`, {
      method: 'POST',
      body: JSON.stringify({ blockedUserId }),
    });
  }

  async unblockUser(userId: number, blockedUserId: number) {
    return this.request(`/users/${userId}/blocked`, {
      method: 'DELETE',
      body: JSON.stringify({ blockedUserId }),
    });
  }

  // Posts methods
  async getPosts(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Post>>> {
    return this.request<PaginatedResponse<Post>>(`/posts?page=${page}&limit=${limit}`);
  }

  async createPost(formData: FormData): Promise<ApiResponse<Post>> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: formData,
    });
  }

  async likePost(postId: number) {
    return this.request(`/posts/${postId}/like`, { method: 'POST' });
  }

  async unlikePost(postId: number) {
    return this.request(`/posts/${postId}/like`, { method: 'DELETE' });
  }

  async deletePost(postId: number) {
    return this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  // Trends methods
  async getTrends(): Promise<ApiResponse<Trend[]>> {
    return this.request<Trend[]>('/trends');
  }

  async getTrendLeaderboard(trendId: number): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.request<LeaderboardEntry[]>(`/trends/${trendId}/leaderboard`);
  }

  // Search methods
  async search(query: string, type?: string): Promise<ApiResponse<SearchResults>> {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    
    return this.request<SearchResults>(`/search/global?${params}`);
  }

  // Comments methods
  async getComments(postId: number): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/posts/${postId}/comments`);
  }

  async createComment(postId: number, content: string, parentCommentId?: number): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
  }

  async updateComment(commentId: number, content: string): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: number) {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Messages methods
  async getConversations(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/messages/conversations');
  }

  async getMessages(userId: number): Promise<ApiResponse<Message[]>> {
    return this.request<Message[]>(`/messages/${userId}`);
  }

  async sendMessage(userId: number, content: string): Promise<ApiResponse<Message>> {
    return this.request<Message>(`/messages/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Stories methods
  async getStories(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/stories');
  }

  async createStory(formData: FormData): Promise<ApiResponse<Story>> {
    return this.request<Story>('/stories', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteStory(storyId: number) {
    return this.request(`/stories/${storyId}`, {
      method: 'DELETE',
    });
  }

  async cleanupExpiredStories() {
    return this.request('/stories/cleanup', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
export default api;