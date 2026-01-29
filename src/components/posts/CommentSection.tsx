'use client';

import { useState, useEffect } from 'react';
import { Send, Heart, MessageCircle, ChevronDown, ChevronUp, ThumbsDown, MoreHorizontal, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Comment, User } from '@/types';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useConfirmation } from '@/hooks/useConfirmation';

interface CommentSectionProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface CommentWithReplies extends Comment {
  replies?: Comment[];
  likeCount?: number;
  dislikeCount?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  showReplies?: boolean;
}

export default function CommentSection({ postId, isOpen, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lastCommentCount, setLastCommentCount] = useState(0);
  const { confirm, ConfirmationComponent } = useConfirmation();

  useEffect(() => {
    // Get current user
    const fetchCurrentUser = async () => {
      try {
        const response = await api.getCurrentUser();
        if (response.success && response.data) {
          setCurrentUser(response.data.user || response.data);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, postId]);

  // Separate useEffect for polling to avoid dependency array size changes
  useEffect(() => {
    if (!isOpen || comments.length === 0) return;

    // Only set up polling if we have comments
    const interval = setInterval(loadComments, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isOpen, comments.length]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await api.getComments(postId);
      if (response.success && response.data) {
        const newComments = response.data.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
          likeCount: comment.likeCount || 0,
          dislikeCount: comment.dislikeCount || 0,
          isLiked: comment.isLiked || false,
          isDisliked: comment.isDisliked || false,
          showReplies: comment.showReplies || false,
          replies: (comment.replies || []).map((reply: any) => ({
            ...reply,
            createdAt: new Date(reply.createdAt),
            updatedAt: new Date(reply.updatedAt),
          })),
        }));
        
        // Check for new comments and show notification
        const totalComments = newComments.reduce((acc, comment) => acc + 1 + (comment.replies?.length || 0), 0);
        if (lastCommentCount > 0 && totalComments > lastCommentCount) {
          const newCount = totalComments - lastCommentCount;
          toast.success(`${newCount} new comment${newCount > 1 ? 's' : ''} added!`, {
            duration: 3000,
          });
        }
        setLastCommentCount(totalComments);
        
        setComments(newComments);
      } else {
        console.error('Failed to load comments:', response.error);
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSending) return;

    if (!currentUser) {
      toast.error('Please log in to comment');
      return;
    }

    setIsSending(true);
    try {
      const response = await api.createComment(postId, newComment.trim());

      if (response.success && response.data) {
        const newCommentData: CommentWithReplies = {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          likeCount: 0,
          dislikeCount: 0,
          isLiked: false,
          isDisliked: false,
          showReplies: false,
          replies: [],
        };

        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        toast.success('Comment added!');
      } else {
        toast.error(response.error || 'Failed to add comment');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!replyText.trim() || isSending) return;

    if (!currentUser) {
      toast.error('Please log in to reply');
      return;
    }

    setIsSending(true);
    try {
      const response = await api.createComment(postId, replyText.trim(), commentId);

      if (response.success && response.data) {
        const newReply: Comment = {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
        };

        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                replies: [...(comment.replies || []), newReply],
                showReplies: true 
              }
            : comment
        ));
        
        setReplyText('');
        setReplyingTo(null);
        toast.success('Reply added!');
      } else {
        toast.error(response.error || 'Failed to add reply');
      }
    } catch (error) {
      toast.error('Failed to add reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleLikeComment = (commentId: number) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            isDisliked: comment.isLiked ? comment.isDisliked : false,
            likeCount: comment.isLiked 
              ? (comment.likeCount || 0) - 1 
              : (comment.likeCount || 0) + 1,
            dislikeCount: comment.isLiked && comment.isDisliked 
              ? (comment.dislikeCount || 0) - 1 
              : comment.dislikeCount
          }
        : comment
    ));
  };

  const handleEditComment = (commentId: number, currentContent: string) => {
    setEditingComment(commentId);
    setEditText(currentContent);
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editText.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await api.updateComment(commentId, editText.trim());

      if (response.success) {
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: editText.trim(), updatedAt: new Date() }
            : {
                ...comment,
                replies: comment.replies?.map(reply =>
                  reply.id === commentId
                    ? { ...reply, content: editText.trim(), updatedAt: new Date() }
                    : reply
                )
              }
        ));
        
        setEditingComment(null);
        setEditText('');
        toast.success('Comment updated!');
      } else {
        toast.error(response.error || 'Failed to update comment');
      }
    } catch (error) {
      toast.error('Failed to update comment');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const confirmed = await confirm({
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'warning',
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      const response = await api.deleteComment(commentId);

      if (response.success) {
        setComments(prev => prev.filter(comment => {
          if (comment.id === commentId) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
          }
          return true;
        }));
        
        toast.success('Comment deleted!');
      } else {
        toast.error(response.error || 'Failed to delete comment');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleDislikeComment = (commentId: number) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isDisliked: !comment.isDisliked,
            isLiked: comment.isDisliked ? comment.isLiked : false,
            dislikeCount: comment.isDisliked 
              ? (comment.dislikeCount || 0) - 1 
              : (comment.dislikeCount || 0) + 1,
            likeCount: comment.isDisliked && comment.isLiked 
              ? (comment.likeCount || 0) - 1 
              : comment.likeCount
          }
        : comment
    ));
  };

  const toggleReplies = (commentId: number) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, showReplies: !comment.showReplies }
        : comment
    ));
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'now';
    }
    
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'now';
  };

  const formatLikeCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="border-t bg-background">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">
            Comments {comments.length > 0 && `(${comments.reduce((acc, comment) => acc + 1 + (comment.replies?.length || 0), 0)})`}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </Button>
        </div>

        {/* Add Comment Form */}
        {currentUser && (
          <form onSubmit={handleSubmitComment} className="flex space-x-3 mb-6">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.profileImageUrl} />
              <AvatarFallback className="bg-primary/10">
                {(currentUser.displayName || currentUser.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex space-x-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSending}
                maxLength={500}
                className="flex-1 border-muted-foreground/20 focus:border-primary"
              />
              <Button 
                type="submit" 
                disabled={!newComment.trim() || isSending} 
                size="sm"
                className="px-4"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        )}

        {!currentUser && (
          <div className="text-center py-4 text-muted-foreground">
            <p>Please log in to comment</p>
          </div>
        )}

        {/* Comments List */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment, index) => (
                <div key={`comment-${comment.id}-${index}`} className="space-y-3">
                  {/* Main Comment */}
                  <div className="flex space-x-3">
                    <Avatar className="h-10 w-10 ring-2 ring-background">
                      <AvatarImage src={comment.user.profileImageUrl} />
                      <AvatarFallback className="bg-primary/10">
                        {(comment.user.displayName || comment.user.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-foreground">
                            @{comment.user.username}
                          </span>
                          {comment.user.isVerified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                            {comment.updatedAt > comment.createdAt && (
                              <span className="ml-1">(edited)</span>
                            )}
                          </span>
                        </div>
                        
                        {/* Comment Options Menu */}
                        {currentUser && currentUser.id === comment.user.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditComment(comment.id, comment.content)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      {/* Comment Content - Edit Mode */}
                      {editingComment === comment.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-sm"
                            maxLength={500}
                            autoFocus
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(comment.id)}
                              disabled={!editText.trim() || isSending}
                              className="h-7 px-3"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="h-7 px-3"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-foreground">{comment.content}</p>
                      )}
                      
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-2 text-xs hover:bg-red-50 hover:text-red-600 ${
                            comment.isLiked ? 'text-red-500 bg-red-50' : 'text-muted-foreground'
                          }`}
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                          {comment.likeCount ? formatLikeCount(comment.likeCount) : '0'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-2 text-xs hover:bg-blue-50 hover:text-blue-600 ${
                            comment.isDisliked ? 'text-blue-500 bg-blue-50' : 'text-muted-foreground'
                          }`}
                          onClick={() => handleDislikeComment(comment.id)}
                        >
                          <ThumbsDown className={`h-4 w-4 mr-1 ${comment.isDisliked ? 'fill-current' : ''}`} />
                          {comment.dislikeCount ? formatLikeCount(comment.dislikeCount) : ''}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          Reply
                        </Button>
                      </div>

                      {/* Reply Form */}
                      {replyingTo === comment.id && currentUser && (
                        <div className="flex space-x-2 mt-3 pl-2 border-l-2 border-muted">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.profileImageUrl} />
                            <AvatarFallback className="bg-primary/10 text-xs">
                              {(currentUser.displayName || currentUser.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex space-x-2">
                            <Input
                              placeholder={`Reply to @${comment.user.username}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              disabled={isSending}
                              maxLength={500}
                              className="flex-1 text-sm border-muted-foreground/20 focus:border-primary"
                            />
                            <Button 
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={!replyText.trim() || isSending} 
                              size="sm"
                              className="px-3"
                            >
                              {isSending ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-13 space-y-3">
                      {/* Show/Hide Replies Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-2 h-7"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        {comment.showReplies ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Hide {comment.replies.length} replies
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            View {comment.replies.length} replies
                          </>
                        )}
                      </Button>

                      {/* Replies List */}
                      {comment.showReplies && (
                        <div className="space-y-3 border-l-2 border-muted pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={reply.user.profileImageUrl} />
                                <AvatarFallback className="bg-primary/10 text-xs">
                                  {(reply.user.displayName || reply.user.username).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-sm">
                                      @{reply.user.username}
                                    </span>
                                    {reply.user.isVerified && (
                                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                      </div>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeAgo(reply.createdAt)}
                                      {reply.updatedAt > reply.createdAt && (
                                        <span className="ml-1">(edited)</span>
                                      )}
                                    </span>
                                  </div>
                                  
                                  {/* Reply Options Menu */}
                                  {currentUser && currentUser.id === reply.user.id && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditComment(reply.id, reply.content)}>
                                          <Edit className="h-3 w-3 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteComment(reply.id)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="h-3 w-3 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                                
                                {/* Reply Content - Edit Mode */}
                                {editingComment === reply.id ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="text-sm"
                                      maxLength={500}
                                      autoFocus
                                    />
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveEdit(reply.id)}
                                        disabled={!editText.trim() || isSending}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm leading-relaxed">{reply.content}</p>
                                )}
                                
                                <div className="flex items-center space-x-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                  >
                                    <Heart className="h-3 w-3 mr-1" />
                                    0
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-blue-500 hover:bg-blue-50"
                                  >
                                    <ThumbsDown className="h-3 w-3 mr-1" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                                  >
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
}