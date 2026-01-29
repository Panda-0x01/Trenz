'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import PostCard from '@/components/posts/PostCard';
import TrendCard from '@/components/trends/TrendCard';
import CreateTrendCard from '@/components/trends/CreateTrendCard';
import StoryRing from '@/components/stories/StoryRing';
import StoryViewer from '@/components/stories/StoryViewer';
import CreateStoryModal from '@/components/stories/CreateStoryModal';
import { Post, Trend, Story } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useConfirmation } from '@/hooks/useConfirmation';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [stories, setStories] = useState<{ user: any; stories: Story[] }[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [storyViewerIndex, setStoryViewerIndex] = useState({ userIndex: 0, storyIndex: 0 });
  const [showCreateStory, setShowCreateStory] = useState(false);
  const { confirm, ConfirmationComponent } = useConfirmation();

  useEffect(() => {
    loadCurrentUser();
    loadPosts();
    loadTrends();
    loadStories();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        setCurrentUser(response.data.user || response.data);
      }
    } catch (error) {
      console.error('Failed to load current user');
    }
  };

  const loadStories = useCallback(async () => {
    try {
      const response = await api.getStories();
      if (response.success && response.data) {
        setStories(response.data);
      }
    } catch (error) {
      console.error('Failed to load stories');
    } finally {
      setIsLoadingStories(false);
    }
  }, []);

  const loadPosts = async () => {
    try {
      const response = await api.getPosts(1, 20);
      if (response.success && response.data) {
        setPosts(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadTrends = async () => {
    try {
      const response = await api.getTrends();
      if (response.success && response.data) {
        const activeTrends = response.data.filter((trend: Trend) => trend.isActive);
        setTrends(activeTrends.slice(0, 3)); // Show top 3 active trends
      }
    } catch (error) {
      toast.error('Failed to load trends');
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const handleLike = (postId: number) => {
    // Optimistically update the UI
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

  const handleComment = (postId: number) => {
    // This will be handled by the PostCard's internal comment section
    console.log('Comment on post:', postId);
  };

  const handleSave = (postId: number) => {
    toast.info('Save feature coming soon!');
  };

  const handleFollow = (userId: number) => {
    toast.info('Follow feature coming soon!');
  };

  const handleReport = (postId: number) => {
    toast.info('Report feature coming soon!');
  };

  const handleDeletePost = async (postId: number) => {
    const confirmed = await confirm({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'warning',
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      const response = await api.deletePost(postId);

      if (response.success) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        toast.success('Post deleted successfully!');
      } else {
        toast.error(response.error || 'Failed to delete post');
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleJoinTrend = (trendId: number) => {
    // Navigate to create post with trend preselected
    window.location.href = `/create?trend=${trendId}`;
  };

  const handleStoryClick = useCallback((userIndex: number, storyIndex: number = 0) => {
    setStoryViewerIndex({ userIndex, storyIndex });
    setShowStoryViewer(true);
  }, []);

  const handleCreateStory = useCallback(() => {
    setShowCreateStory(true);
  }, []);

  const handleStoryCreated = useCallback(() => {
    loadStories(); // Reload stories after creating a new one
  }, [loadStories]);

  const handleCloseStoryViewer = useCallback(() => {
    setShowStoryViewer(false);
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stories Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
        {isLoadingStories ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-3 md:gap-4 pb-2">
              {/* Current User's Story / Add Story */}
              {currentUser && (
                <StoryRing
                  user={currentUser}
                  hasStories={stories.some(s => s.user.id === currentUser.id)}
                  isOwnStory={true}
                  onClick={handleCreateStory}
                />
              )}
              
              {/* Other Users' Stories */}
              {stories.map((userStories, index) => (
                <StoryRing
                  key={userStories.user.id}
                  user={userStories.user}
                  hasStories={true}
                  onClick={() => handleStoryClick(index)}
                />
              ))}
              
              {stories.length === 0 && !isLoadingStories && (
                <div className="flex items-center justify-center w-full py-8 text-muted-foreground">
                  <p className="text-sm">No stories yet. Be the first to share!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Posts Feed */}
      {isLoadingPosts ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4 md:space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={(postId) => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Check out this post on Trenz',
                    url: `${window.location.origin}/posts/${postId}`,
                  });
                } else {
                  navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
                  toast.success('Link copied to clipboard!');
                }
              }}
              onSave={handleSave}
              onFollow={handleFollow}
              onReport={handleReport}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mx-2 md:mx-0">
          <div className="mb-6">
            <div className="h-20 w-20 md:h-24 md:w-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
              <Plus className="h-10 w-10 md:h-12 md:w-12 text-purple-500" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Welcome to Trenz!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto px-4">
              Your feed is empty because no one has created posts yet. Be the first to share your creativity and join a trending competition!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
              <Link href="/explore">Explore Trends</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Story Viewer */}
      {showStoryViewer && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          initialUserIndex={storyViewerIndex.userIndex}
          initialStoryIndex={storyViewerIndex.storyIndex}
          onClose={handleCloseStoryViewer}
          onStoryDeleted={handleStoryCreated}
          currentUser={currentUser}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onStoryCreated={handleStoryCreated}
      />

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
}