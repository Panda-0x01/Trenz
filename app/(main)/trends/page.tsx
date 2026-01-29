'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface VideoPostProps {
  post: Post;
  isVisible: boolean;
  onLike: (postId: number) => void;
}

function VideoPost({ post, isVisible, onLike }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isVisible]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.unlikePost(post.id);
        setLikeCount(prev => prev - 1);
      } else {
        await api.likePost(post.id);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
      onLike(post.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Card className="relative w-full max-w-sm md:max-w-md mx-auto bg-black rounded-2xl overflow-hidden">
      <div className="relative aspect-[9/16]">
        {/* Video */}
        <video
          ref={videoRef}
          src={post.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <Play className="h-6 w-6 md:h-8 md:w-8 ml-1" />
            </Button>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-3 md:top-4 left-3 md:left-4 right-3 md:right-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white">
              <AvatarImage src={post.user.profileImageUrl} />
              <AvatarFallback className="bg-purple-600 text-white">
                {(post.user.displayName || post.user.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-xs md:text-sm">
                {post.user.displayName || post.user.username}
              </p>
              <p className="text-white/70 text-xs">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10"
          >
            <MoreHorizontal className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>

        {/* Side Controls */}
        <div className="absolute right-2 md:right-4 bottom-16 md:bottom-20 flex flex-col space-y-3 md:space-y-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={`text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12 ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-5 w-5 md:h-6 md:w-6 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <span className="text-white text-xs text-center">{likeCount}</span>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12"
          >
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <span className="text-white text-xs text-center">{post._count?.comments || 0}</span>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12"
          >
            <Share className="h-5 w-5 md:h-6 md:w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12"
          >
            <Bookmark className="h-5 w-5 md:h-6 md:w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12"
          >
            {isMuted ? <VolumeX className="h-5 w-5 md:h-6 md:w-6" /> : <Volume2 className="h-5 w-5 md:h-6 md:w-6" />}
          </Button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-16 md:right-20">
            <p className="text-white text-xs md:text-sm leading-relaxed">
              {post.caption}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function TrendsPage() {
  const [videoPosts, setVideoPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleVideoIndex, setVisibleVideoIndex] = useState(0);

  useEffect(() => {
    loadVideoPosts();
  }, []);

  const loadVideoPosts = async () => {
    try {
      const response = await api.getPosts(1, 50);
      if (response.success && response.data) {
        // Filter only video posts
        const videoOnly = response.data.data.filter((post: Post) => 
          post.postType === 'VIDEO' && post.videoUrl
        );
        setVideoPosts(videoOnly);
      }
    } catch (error) {
      toast.error('Failed to load video posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (postId: number) => {
    setVideoPosts(prevPosts =>
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== visibleVideoIndex && newIndex < videoPosts.length) {
      setVisibleVideoIndex(newIndex);
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : videoPosts.length > 0 ? (
        <div 
          className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {videoPosts.map((post, index) => (
            <div key={post.id} className="h-screen flex items-center justify-center snap-start p-2 md:p-4">
              <VideoPost 
                post={post} 
                isVisible={index === visibleVideoIndex}
                onLike={handleLike}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-center">
            <div className="h-20 w-20 md:h-24 md:w-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
              <Play className="h-10 w-10 md:h-12 md:w-12 text-purple-500" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">No Video Posts Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto px-4">
              Video posts will appear here. Create your first video post to get started!
            </p>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}