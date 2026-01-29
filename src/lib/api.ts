import { ApiResponse, PaginatedResponse } from '@/types';

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
    
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only add Content-Type if not already set and not FormData
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
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
        if (refreshResult.success && refreshResult.data) {
          // Update token and retry the original request
          this.setToken(refreshResult.data.tokens.accessToken);
          
          // Retry the original request with new token
          const retryHeaders = { ...headers };
          retryHeaders.Authorization = `Bearer ${refreshResult.data.tokens.accessToken}`;
          
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
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    const result = await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
    return result;
  }

  async refreshToken() {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refreshToken') 
      : null;
    
    if (!refreshToken) {
      return { success: false, error: 'No refresh token' };
    }

    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User methods
  async getUser(id: number) {
    return this.request(`/users/${id}`);
  }

  async getUserByUsername(username: string) {
    return this.request(`/users/username/${username}`);
  }

  async updateUser(id: number, data: any) {
    // Handle FormData for file uploads
    if (data instanceof FormData) {
      return this.request(`/users/${id}`, {
        method: 'PUT',
        body: data,
        // Don't set Content-Type for FormData, let browser set it
        headers: {},
      });
    }
    
    return this.request(`/users/${id}`, {
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
  async getSavedPosts(userId: number) {
    return this.request(`/users/${userId}/saved`);
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
  async getBlockedUsers(userId: number) {
    return this.request(`/users/${userId}/blocked`);
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
  async getPosts(page = 1, limit = 20) {
    return this.request<PaginatedResponse<any>>(`/posts?page=${page}&limit=${limit}`);
  }

  async createPost(formData: FormData) {
    return this.request('/posts', {
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
  async getTrends() {
    return this.request('/trends');
  }

  async getTrendLeaderboard(trendId: number) {
    return this.request(`/trends/${trendId}/leaderboard`);
  }

  // Search methods
  async search(query: string, type?: string) {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    
    return this.request(`/search/global?${params}`);
  }

  // Comments methods
  async getComments(postId: number) {
    return this.request(`/posts/${postId}/comments`);
  }

  async createComment(postId: number, content: string, parentCommentId?: number) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
  }

  async updateComment(commentId: number, content: string) {
    return this.request(`/comments/${commentId}`, {
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
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(userId: number) {
    return this.request(`/messages/${userId}`);
  }

  async sendMessage(userId: number, content: string) {
    return this.request(`/messages/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Stories methods
  async getStories() {
    return this.request('/stories');
  }

  async createStory(formData: FormData) {
    return this.request('/stories', {
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