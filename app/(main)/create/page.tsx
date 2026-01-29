'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, Image as ImageIcon, X, Loader2, Type, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trend } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTrendId = searchParams.get('trend');

  const [postType, setPostType] = useState<'image' | 'video' | 'text'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedTrendId, setSelectedTrendId] = useState<string>(preselectedTrendId || '');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

  useEffect(() => {
    loadActiveTrends();
  }, []);

  const loadActiveTrends = async () => {
    try {
      const response = await api.getTrends();
      if (response.success && response.data) {
        const activeTrends = response.data.filter((trend: Trend) => trend.isActive);
        setTrends(activeTrends);
        
        // If preselected trend exists, validate it
        if (preselectedTrendId) {
          const trendExists = activeTrends.find((t: Trend) => t.id.toString() === preselectedTrendId);
          if (!trendExists) {
            setSelectedTrendId('');
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load trends');
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (postType === 'image') {
      // Validate image file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (10MB max for images)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
    } else if (postType === 'video') {
      // Validate video file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }

      // Validate file size (50MB max for videos)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video size must be less than 50MB');
        return;
      }

      // Check video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        
        if (duration > 60) { // 60 seconds = 1 minute
          toast.error('Video duration must be less than 1 minute');
          return;
        }
        
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      };
      
      video.src = URL.createObjectURL(file);
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (postType === 'image' && !selectedFile) {
      toast.error('Please select an image');
      return;
    }

    if (postType === 'video' && !selectedFile) {
      toast.error('Please select a video');
      return;
    }

    if (postType === 'text' && !textContent.trim()) {
      toast.error('Please enter some text content');
      return;
    }

    if (!selectedTrendId) {
      toast.error('Please select a trend');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      
      if (postType === 'image') {
        formData.append('image', selectedFile!);
        if (caption.trim()) {
          formData.append('caption', caption.trim());
        }
      } else if (postType === 'video') {
        formData.append('video', selectedFile!);
        if (caption.trim()) {
          formData.append('caption', caption.trim());
        }
      } else {
        formData.append('textContent', textContent.trim());
      }
      
      formData.append('trendId', selectedTrendId);
      formData.append('postType', postType);

      const response = await api.createPost(formData);
      
      if (response.success) {
        toast.success('Post created successfully!');
        router.push('/home');
      } else {
        toast.error(response.error || 'Failed to create post');
      }
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTrend = trends.find(t => t.id.toString() === selectedTrendId);

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-2xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Create New Post</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Share your creativity with image posts, video posts, or text posts and join trending competitions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Post Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Post Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={postType} onValueChange={(value) => setPostType(value as 'image' | 'video' | 'text')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="image" className="mt-4">
                {/* Image Upload */}
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Click to upload image</p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG, WebP up to 10MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={previewUrl!}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      <span>{selectedFile.name}</span>
                      <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="video" className="mt-4">
                {/* Video Upload */}
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Click to upload video</p>
                      <p className="text-sm text-muted-foreground">
                        MP4, WebM, MOV up to 50MB (max 1 minute)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        src={previewUrl!}
                        controls
                        className="w-full h-64 object-cover rounded-lg"
                      >
                        Your browser does not support the video tag.
                      </video>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span>{selectedFile.name}</span>
                      <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="text" className="mt-4">
                {/* Text Content */}
                <div className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind? Share your thoughts about this trend..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    maxLength={5000}
                    rows={8}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {textContent.length}/5000 characters
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Type className="h-4 w-4" />
                      <span>Text Post</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trend Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingTrends ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <Select value={selectedTrendId} onValueChange={setSelectedTrendId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a trend to join" />
                  </SelectTrigger>
                  <SelectContent>
                    {trends.map((trend) => (
                      <SelectItem key={trend.id} value={trend.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{trend.name}</span>
                          <Badge variant="outline" className="text-xs">
                            #{trend.hashtag}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTrend && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">{selectedTrend.name}</h4>
                    {selectedTrend.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedTrend.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>#{selectedTrend.hashtag}</span>
                      <span>{selectedTrend._count?.posts || 0} posts</span>
                      <span>Ends {new Date(selectedTrend.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Caption/Description */}
        {(postType === 'image' || postType === 'video') && (
          <Card>
            <CardHeader>
              <CardTitle>Caption</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write a caption for your post... (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={2200}
                rows={4}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  {caption.length}/2200 characters
                </p>
                {selectedTrend && (
                  <Badge variant="outline">
                    #{selectedTrend.hashtag}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={(postType === 'image' && !selectedFile) || (postType === 'text' && !textContent.trim()) || !selectedTrendId || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Post'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}