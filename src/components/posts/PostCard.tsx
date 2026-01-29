'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, UserPlus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/types';
import api from '@/lib/api';
import CommentSection from './CommentSection';
import { useConfirmation } from '@/hooks/useConfirmation';

interface PostCardProps {
  post: Post;
  showTrendInfo?: boolean;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onSave?: (postId: number) => void;
  onFollow?: (userId: number) => void;
  onReport?: (postId: number) => void;
  onDelete?: (postId: number) => void;
}

export default function PostCard({
  post,
  showTrendInfo = true,
  onLike,
  onComment,
  onShare,
  onSave,
  onFollow,
  onReport,
  onDelete,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { confirm, ConfirmationComponent } = useConfirmation();

  useEffect(() => {
    // Get current user for permission checks
    const fetchCurrentUser = async () => {
      try {
        const response = await api.getCurrentUser();
        if (response.success && response.data) {
          setCurrentUser(response.data as User);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

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
      onLike?.(post.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(post.id);
  };

  const handleShare = () => {
    onShare?.(post.id);
  };

  const handleComment = () => {
    setShowComments(!showComments);
    onComment?.(post.id);
  };

  const handleFollow = () => {
    onFollow?.(post.userId);
  };

  const handleReport = () => {
    onReport?.(post.id);
  };

  return (
    <Card className="w-full max-w-none mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarImage src={post.user.profileImageUrl} alt={post.user.displayName || post.user.username} />
              <AvatarFallback>
                {(post.user.displayName || post.user.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-2">
                <Link 
                  href={`/profile/${post.user.username}`}
                  className="font-semibold text-sm hover:underline truncate"
                >
                  {post.user.displayName || post.user.username}
                </Link>
                {post.user.isVerified && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    ✓
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                @{post.user.username} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Show delete option only to post owner */}
              {currentUser && currentUser.id === post.user.id && (
                <>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(post.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {/* Show follow option only if not own post */}
              {currentUser && currentUser.id !== post.user.id && (
                <DropdownMenuItem onClick={handleFollow}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Follow @{post.user.username}
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleReport}>
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showTrendInfo && (
          <Link 
            href={`/trends/${post.trend.id}`}
            className="inline-flex items-center space-x-1 text-sm text-primary hover:underline"
          >
            <span>#{post.trend.hashtag}</span>
            <Badge variant="outline" className="text-xs">
              Trending
            </Badge>
          </Link>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        {post.caption && (
          <p className="text-sm mb-3 leading-relaxed break-words">{post.caption}</p>
        )}
        
        {/* Post Content */}
        {post.postType === 'IMAGE' && post.imageUrl ? (
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={post.imageUrl}
              alt={post.imageAltText || 'Post image'}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              quality={95}
              priority={false}
            />
          </div>
        ) : post.postType === 'VIDEO' && post.videoUrl ? (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <video
              src={post.videoUrl}
              controls
              className="w-full h-full object-cover"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : post.postType === 'TEXT' && post.textContent ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
            <div className="flex items-start gap-3">
              {/* Thread indicator */}
              <div className="flex flex-col items-center mt-1 flex-shrink-0">
                <div className="w-0.5 h-4 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full my-1"></div>
                <div className="w-0.5 h-4 bg-gray-300 rounded-full"></div>
              </div>
              
              {/* Text content */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                  {post.textContent}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3 md:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''} p-2`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              {!post.hideLikeCount && <span className="text-sm">{likeCount}</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center space-x-1 p-2"
            >
              <MessageCircle className="h-5 w-5" />
              {!post.hideCommentCount && <span className="text-sm">{post._count?.comments || 0}</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-1 p-2"
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`${isSaved ? 'text-primary' : ''} p-2`}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardFooter>

      {/* Comments Section */}
      <CommentSection
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </Card>
  );
}