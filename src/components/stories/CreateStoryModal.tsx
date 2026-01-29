'use client';

import { useState } from 'react';
import { X, Upload, Type, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export default function CreateStoryModal({ isOpen, onClose, onStoryCreated }: CreateStoryModalProps) {
  const [storyType, setStoryType] = useState<'image' | 'video' | 'text'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (storyType === 'image') {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
    } else if (storyType === 'video') {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video size must be less than 50MB');
        return;
      }
    }

    setSelectedFile(file);
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

  const handleSubmit = async () => {
    if (storyType === 'image' && !selectedFile) {
      toast.error('Please select an image');
      return;
    }
    if (storyType === 'video' && !selectedFile) {
      toast.error('Please select a video');
      return;
    }
    if (storyType === 'text' && !textContent.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('storyType', storyType);
      
      if (storyType === 'image' && selectedFile) {
        formData.append('image', selectedFile);
      } else if (storyType === 'video' && selectedFile) {
        formData.append('video', selectedFile);
      } else if (storyType === 'text') {
        formData.append('content', textContent.trim());
      }

      console.log('Creating story:', { storyType, hasFile: !!selectedFile, hasText: !!textContent.trim() });

      const response = await api.createStory(formData);
      
      console.log('Story creation response:', response);
      
      if (response.success) {
        toast.success('Story created successfully!');
        onStoryCreated();
        onClose();
        resetForm();
      } else {
        console.error('Story creation failed:', response.error);
        toast.error(response.error || 'Failed to create story');
      }
    } catch (error) {
      console.error('Story creation error:', error);
      toast.error('Failed to create story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStoryType('image');
    setSelectedFile(null);
    setTextContent('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <Tabs value={storyType} onValueChange={(value) => setStoryType(value as 'image' | 'video' | 'text')}>
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

          <TabsContent value="image" className="space-y-4">
            {!selectedFile ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Upload Image</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, WebP up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full max-w-xs mx-auto">
                  <div className="aspect-[9/16] rounded-lg overflow-hidden bg-black">
                    <img
                      src={previewUrl!}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
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
                  <p className="text-lg font-medium mb-2">Upload Video</p>
                  <p className="text-sm text-muted-foreground">
                    MP4, WebM, MOV up to 50MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full max-w-xs mx-auto">
                  <div className="aspect-[9/16] rounded-lg overflow-hidden bg-black">
                    <video
                      src={previewUrl!}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                maxLength={500}
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {textContent.length}/500 characters
                </p>
              </div>
              
              {/* Preview */}
              {textContent.trim() && (
                <div className="w-full max-w-xs mx-auto">
                  <div className="aspect-[9/16] bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center p-6">
                    <div className="max-w-full px-2">
                      <p className="text-white text-base font-medium text-center leading-relaxed break-words hyphens-auto">
                        {textContent}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (storyType === 'text' && !textContent.trim()) || ((storyType === 'image' || storyType === 'video') && !selectedFile)}
            className="flex-1"
          >
            {isLoading ? 'Creating...' : 'Share Story'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}