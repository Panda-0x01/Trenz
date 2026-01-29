'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import PostCard from '@/src/components/posts/PostCard';
import TrendCard from '@/src/components/trends/TrendCard';
import { Post, Trend } from '@/src/types';
import api from '@/src/lib/api';
import { toast } from 'sonner';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

  useEffect(() => {
    loadPosts();
    loadTrends();
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
        setTrends(response.data.slice(0, 3)); // Show top 3 active trends
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Your Feed</h1>
          </div>

          {isLoadingPosts ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={(postId) => console.log('Comment on post:', postId)}
                  onShare={(postId) => console.log('Share post:', postId)}
                  onSave={(postId) => console.log('Save post:', postId)}
                  onFollow={(userId) => console.log('Follow user:', userId)}
                  onReport={(postId) => console.log('Report post:', postId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No posts in your feed yet.</p>
              <p className="text-sm text-muted-foreground">
                Follow some users or check out trending content to see posts here!
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Trends */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Trending Now</h2>
            {isLoadingTrends ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : trends.length > 0 ? (
              <div className="space-y-4">
                {trends.map((trend) => (
                  <TrendCard
                    key={trend.id}
                    trend={trend}
                    showJoinButton={true}
                    onJoin={(trendId) => console.log('Join trend:', trendId)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No active trends right now.</p>
            )}
          </div>

          {/* Quick Stats or Suggestions could go here */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Welcome to Trenz!</h3>
            <p className="text-sm text-muted-foreground">
              Join trending competitions, share your creativity, and climb the leaderboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}