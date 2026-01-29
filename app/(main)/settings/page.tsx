'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, Lock, Bookmark, Bell, Palette, LogOut, Save, Camera, Upload, X, Shield, Eye, EyeOff, Users, MessageSquare, Heart, UserX, HelpCircle, FileText, Video, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PostCard from '@/components/posts/PostCard';
import { User as UserType, Post } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<File | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Notification settings
  const [pauseAllNotifications, setPauseAllNotifications] = useState(false);
  const [postNotifications, setPostNotifications] = useState(true);
  const [storyNotifications, setStoryNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [followNotifications, setFollowNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [trendWinnerNotifications, setTrendWinnerNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['account', 'saves', 'notifications', 'privacy', 'blocked', 'help'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    loadSavedPosts();
    loadBlockedUsers();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        const currentUser = response.data.user || response.data;
        console.log('Loaded user data:', currentUser);
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setBio(currentUser.bio || '');
        setIsPrivate(currentUser.isPrivate || false);
        setProfileImagePreview(currentUser.profileImageUrl || null);
        setHeaderImagePreview(currentUser.headerImageUrl || null);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setProfileImage(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setProfileImagePreview(url);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImagePreview(user?.profileImageUrl || null);
  };

  const handleHeaderImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setHeaderImage(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setHeaderImagePreview(url);
  };

  const removeHeaderImage = () => {
    setHeaderImage(null);
    if (headerImagePreview && headerImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(headerImagePreview);
    }
    setHeaderImagePreview(user?.headerImageUrl || null);
  };

  const loadSavedPosts = async () => {
    if (!user) return;
    
    try {
      const response = await api.getSavedPosts(user.id);
      if (response.success && response.data) {
        setSavedPosts(response.data);
      } else {
        setSavedPosts([]);
      }
    } catch (error) {
      console.error('Failed to load saved posts:', error);
      setSavedPosts([]);
    }
  };

  const loadBlockedUsers = async () => {
    if (!user) return;
    
    try {
      const response = await api.getBlockedUsers(user.id);
      if (response.success && response.data) {
        setBlockedUsers(response.data);
      } else {
        setBlockedUsers([]);
      }
    } catch (error) {
      console.error('Failed to load blocked users:', error);
      setBlockedUsers([]);
    }
  };

  const handleUnblockUser = async (userId: number) => {
    if (!user) return;
    
    try {
      const response = await api.unblockUser(user.id, userId);
      if (response.success) {
        setBlockedUsers(prev => prev.filter(blockedUser => blockedUser.id !== userId));
        toast.success('User unblocked successfully');
      } else {
        toast.error(response.error || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Failed to unblock user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('displayName', displayName.trim() || user.username);
      formData.append('bio', bio.trim());
      formData.append('isPrivate', isPrivate.toString());
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      if (headerImage) {
        formData.append('headerImage', headerImage);
      }

      console.log('Saving profile with data:', {
        displayName: displayName.trim() || user.username,
        bio: bio.trim(),
        isPrivate: isPrivate.toString(),
        hasProfileImage: !!profileImage,
        hasHeaderImage: !!headerImage,
      });

      const response = await api.updateUser(user.id, formData);
      
      if (response.success && response.data) {
        setUser(response.data);
        toast.success('Profile updated successfully!');
        
        // Clear the selected files after successful upload
        if (profileImage) {
          setProfileImage(null);
        }
        if (headerImage) {
          setHeaderImage(null);
        }
      } else {
        console.error('Update failed:', response.error);
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Account deleted successfully');
        router.push('/login');
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  const handleLike = (postId: number) => {
    setSavedPosts(prevPosts =>
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
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 md:h-6 md:w-6" />
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-1">
          <TabsTrigger value="account" className="text-xs md:text-sm px-2 py-2">Account</TabsTrigger>
          <TabsTrigger value="saves" className="text-xs md:text-sm px-2 py-2">Saves</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs md:text-sm px-2 py-2">Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs md:text-sm px-2 py-2">Privacy</TabsTrigger>
          <TabsTrigger value="blocked" className="text-xs md:text-sm px-2 py-2">Blocked</TabsTrigger>
          <TabsTrigger value="help" className="text-xs md:text-sm px-2 py-2">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                Your Account
              </CardTitle>
              <CardDescription className="text-sm">
                Accounts Center - password, security, personal details, and all current options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Profile Picture Upload */}
              <div className="space-y-4">
                <Label className="text-sm md:text-base">Profile Picture</Label>
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 md:h-24 md:w-24">
                      <AvatarImage src={profileImagePreview || undefined} />
                      <AvatarFallback className="text-lg md:text-2xl">
                        {(user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {profileImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeProfileImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-center sm:text-left">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageSelect}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label htmlFor="profile-image-upload">
                      <Button type="button" variant="outline" className="cursor-pointer text-sm" asChild>
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          Change Picture
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WebP. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Header Image Upload */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Header Image</Label>
                <p className="text-sm text-muted-foreground">
                  This will be displayed as a banner on your profile page
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="w-full h-32 md:h-40 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg overflow-hidden">
                      {headerImagePreview ? (
                        <img
                          src={headerImagePreview}
                          alt="Header preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-white/80 text-center">
                            <h3 className="text-base md:text-lg font-semibold mb-1">{user?.displayName || user?.username}</h3>
                            <p className="text-xs md:text-sm opacity-75">Upload a header image</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    {headerImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 md:h-8 md:w-8"
                        onClick={removeHeaderImage}
                      >
                        <X className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeaderImageSelect}
                      className="hidden"
                      id="header-image-upload"
                    />
                    <label htmlFor="header-image-upload">
                      <Button type="button" variant="outline" className="cursor-pointer text-sm w-full sm:w-auto" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {headerImagePreview ? 'Change Header' : 'Upload Header'}
                        </span>
                      </Button>
                    </label>
                    {headerImagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={removeHeaderImage}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm w-full sm:w-auto"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP. Max size 10MB. Recommended: 1500x500px for best results
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user?.username || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Contact support to change your email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/500 characters
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Security & Password</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Your Data
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saves" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Bookmark className="h-4 w-4 md:h-5 md:w-5" />
                Saves
              </CardTitle>
              <CardDescription className="text-sm">
                Show all saved posts, videos, and text content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  {savedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {savedPosts.map((post) => (
                        <PostCard key={post.id} post={post} onLike={handleLike} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 md:py-12">
                      <Bookmark className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-base md:text-lg font-semibold mb-2">No saved content</h3>
                      <p className="text-muted-foreground text-sm">
                        Content you save will appear here
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="posts" className="mt-4">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No saved posts</h3>
                    <p className="text-muted-foreground text-sm">
                      Image posts you save will appear here
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="videos" className="mt-4">
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No saved videos</h3>
                    <p className="text-muted-foreground text-sm">
                      Video posts you save will appear here
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="mt-4">
                  <div className="text-center py-8">
                    <Type className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No saved text posts</h3>
                    <p className="text-muted-foreground text-sm">
                      Text posts you save will appear here
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Pause all notifications, posts, stories, and comments notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="font-medium">Pause All Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily pause all notifications from Trenz
                  </p>
                </div>
                <Switch
                  checked={pauseAllNotifications}
                  onCheckedChange={setPauseAllNotifications}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Content Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Post Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Likes, comments, and shares on your posts
                      </p>
                    </div>
                    <Switch
                      checked={postNotifications}
                      onCheckedChange={setPostNotifications}
                      disabled={pauseAllNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Stories Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Views and reactions on your stories
                      </p>
                    </div>
                    <Switch
                      checked={storyNotifications}
                      onCheckedChange={setStoryNotifications}
                      disabled={pauseAllNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Comments Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        New comments on your posts and replies to your comments
                      </p>
                    </div>
                    <Switch
                      checked={commentNotifications}
                      onCheckedChange={setCommentNotifications}
                      disabled={pauseAllNotifications}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Social Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Following & Followers Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        New followers and follow requests
                      </p>
                    </div>
                    <Switch
                      checked={followNotifications}
                      onCheckedChange={setFollowNotifications}
                      disabled={pauseAllNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Message Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        New direct messages and message requests
                      </p>
                    </div>
                    <Switch
                      checked={messageNotifications}
                      onCheckedChange={setMessageNotifications}
                      disabled={pauseAllNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Trend Winner Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        When you win or place in trend competitions
                      </p>
                    </div>
                    <Switch
                      checked={trendWinnerNotifications}
                      onCheckedChange={setTrendWinnerNotifications}
                      disabled={pauseAllNotifications}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Delivery Method</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Who Can See Your Content
              </CardTitle>
              <CardDescription>
                Control who can see your content and interact with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Account Privacy</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Private Account</Label>
                    <p className="text-sm text-muted-foreground">
                      When your account is private, only approved followers can see your posts
                    </p>
                  </div>
                  <Switch
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Content Visibility</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Posts Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Who can see your posts and stories
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {isPrivate ? 'Followers Only' : 'Everyone'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Story Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Who can see your stories
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {isPrivate ? 'Followers Only' : 'Everyone'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Who can see your profile information
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Everyone
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Interactions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Who can message you</Label>
                      <p className="text-sm text-muted-foreground">
                        Control who can send you direct messages
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Everyone
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Who can comment</Label>
                      <p className="text-sm text-muted-foreground">
                        Control who can comment on your posts
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Everyone
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Who can tag you</Label>
                      <p className="text-sm text-muted-foreground">
                        Control who can tag you in posts and stories
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Everyone
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Blocked Users
              </CardTitle>
              <CardDescription>
                Show blocked users and manage your block list
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blockedUsers.length > 0 ? (
                <div className="space-y-4">
                  {blockedUsers.map((blockedUser) => (
                    <div key={blockedUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={blockedUser.profileImageUrl} />
                          <AvatarFallback>
                            {(blockedUser.displayName || blockedUser.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{blockedUser.displayName || blockedUser.username}</p>
                          <p className="text-sm text-muted-foreground">@{blockedUser.username}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblockUser(blockedUser.id)}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <UserX className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">No blocked users</h3>
                  <p className="text-muted-foreground text-sm">
                    Users you block will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                How to Use Trenz
              </CardTitle>
              <CardDescription>
                Learn how to make the most of Trenz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Getting Started</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    How to Create Your First Post
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Finding and Following People
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Understanding Trends and Competitions
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Features</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    Creating and Sharing Stories
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Using Direct Messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Saving and Organizing Content
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Support</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Frequently Asked Questions
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Community Guidelines
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Account Actions</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Your Data
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleDeleteAccount}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Logout Section */}
      <Card className="mt-4 md:mt-6">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium">Sign Out</h3>
              <p className="text-sm text-muted-foreground">
                Sign out of your Trenz account
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}