'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/posts/PostCard';
import { Post, Trend } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'trends'>('posts');

  useEffect(() => {
    loadPosts();
    loadTrends();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await api.getPosts(1, 50);
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
        setTrends(response.data);
      }
    } catch (error) {
      toast.error('Failed to load trends');
    } finally {
      setIsLoadingTrends(false);
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-2">Explore</h1>
        <p className="text-gray-600 text-sm md:text-base">Discover trending content and popular posts</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 text-center font-medium transition-colors text-sm md:text-base ${
              activeTab === 'posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Popular Posts
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 text-center font-medium transition-colors text-sm md:text-base ${
              activeTab === 'trends'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Trending Topics
          </button>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'posts' ? (
            isLoadingPosts ? (
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
                    onComment={() => {}}
                    onShare={() => {}}
                    onSave={() => {}}
                    onFollow={() => {}}
                    onReport={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts to explore yet.</p>
              </div>
            )
          ) : (
            isLoadingTrends ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : trends.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {trends.map((trend) => (
                  <Card key={trend.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-orange-500" />
                          <h3 className="font-semibold text-sm md:text-base">#{trend.hashtag}</h3>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {trend._count?.posts || 0} posts
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{trend.description}</p>
                      <Button size="sm" className="w-full text-sm">
                        Join Trend
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No trending topics yet.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}