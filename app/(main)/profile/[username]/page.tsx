'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/posts/PostCard';
import { User, Post } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'following'>('none');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      // Get current user to check if this is their own profile
      const currentUserResponse = await api.getCurrentUser();
      const currentUser = currentUserResponse.success ? (currentUserResponse.data?.user || currentUserResponse.data) : null;
      const isOwnProfile = currentUser && currentUser.username === username;
      setIsCurrentUser(isOwnProfile);

      if (isOwnProfile) {
        // Show current user's profile with real data
        setUser(currentUser);
        loadUserPosts(currentUser.id);
      } else {
        // Load other user's profile by username
        const userResponse = await api.getUserByUsername(username);
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          loadUserPosts(userResponse.data.id);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async (userId: number) => {
    try {
      const response = await api.getPosts(1, 20);
      if (response.success && response.data) {
        // Filter posts by user
        const userPosts = response.data.data.filter((post: Post) => post.userId === userId);
        setPosts(userPosts);
      }
    } catch (error) {
      console.error('Failed to load user posts');
    }
  };

  const handleFollow = async () => {
    try {
      if (followStatus === 'following') {
        setFollowStatus('none');
        toast.success('Unfollowed successfully');
      } else {
        if (user?.isPrivate) {
          setFollowStatus('pending');
          toast.success('Follow request sent');
        } else {
          setFollowStatus('following');
          toast.success('Following successfully');
        }
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const handleMessage = () => {
    window.location.href = '/messages';
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      // Mock upload - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const imageUrl = URL.createObjectURL(file);
      setUser(prev => prev ? { ...prev, profileImageUrl: imageUrl } : null);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleLike = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              _count: {
                ...post._count,
                likes: post.isLiked 
                  ? (post._count?.likes || 0) - 1
                  : (post._count?.likes || 0) + 1
              }
            }
          : post
      )
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen">
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-r from-orange-200 via-pink-200 to-purple-200 overflow-hidden">
        {user.headerImageUrl ? (
          <img
            src={user.headerImageUrl}
            alt={`${user.displayName || user.username}'s header`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:%23fbbf24;stop-opacity:0.3" /><stop offset="50%" style="stop-color:%23f472b6;stop-opacity:0.3" /><stop offset="100%" style="stop-color:%23a855f7;stop-opacity:0.3" /></linearGradient></defs><rect width="1000" height="300" fill="url(%23grad)" /></svg>')`
            }}
          />
        )}
        
        {/* Edit Profile Button */}
        {isCurrentUser && (
          <div className="absolute top-4 right-4">
            <Button 
              variant="outline" 
              className="bg-white/90 hover:bg-white text-black border border-gray-300 rounded-full px-6 py-2 font-medium"
              onClick={() => window.location.href = '/settings'}
            >
              Edit profile
            </Button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="px-4 pb-4">
        {/* Profile Picture */}
        <div className="relative -mt-16 mb-4">
          <div className="relative inline-block">
            <Avatar className="h-32 w-32 border-4 border-white shadow-sm bg-white">
              <AvatarImage src={user.profileImageUrl} />
              <AvatarFallback className="text-2xl bg-gray-100 text-gray-600">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isCurrentUser && (
              <div className="absolute bottom-2 right-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                  id="profile-image-upload"
                  disabled={isUploadingImage}
                />
                <label
                  htmlFor="profile-image-upload"
                  className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-lg border-2 border-white"
                >
                  <Camera className="h-4 w-4" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div>
            <h1 className="text-xl font-bold text-black">{user.displayName || user.username}</h1>
            <p className="text-gray-500">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="text-black text-sm leading-relaxed">{user.bio}</p>
          )}

          {/* Join Date */}
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>

          {/* Follow Stats */}
          <div className="flex items-center gap-6 text-sm">
            <span className="text-black">
              <strong>{user._count?.following || 0}</strong> <span className="text-gray-500 font-normal">Following</span>
            </span>
            <span className="text-black">
              <strong>{user._count?.followers || 0}</strong> <span className="text-gray-500 font-normal">Followers</span>
            </span>
          </div>

          {/* Action Buttons for non-current user */}
          {!isCurrentUser && (
            <div className="flex gap-3 pt-4">
              <Button 
                className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2 font-medium"
                onClick={handleFollow}
              >
                {followStatus === 'following' ? 'Following' : followStatus === 'pending' ? 'Pending' : 'Follow'}
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 text-black hover:bg-gray-50 rounded-full px-6 py-2 font-medium"
                onClick={handleMessage}
              >
                Message
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content Tabs */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={handleLike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No posts yet</p>
                {isCurrentUser && (
                  <Button onClick={() => window.location.href = '/create'}>
                    Create your first post
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Trend participation history will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Achievements and badges will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}