'use client';

import { useState } from 'react';
import { Plus, Calendar, Hash, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

interface CreateTrendCardProps {
  onTrendCreated?: () => void;
}

export default function CreateTrendCard({ onTrendCreated }: CreateTrendCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    hashtag: '',
    description: '',
    duration: 14, // days
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.hashtag.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.request('/trends/create', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.success) {
        toast.success('Trend created successfully!');
        setIsOpen(false);
        setFormData({ name: '', hashtag: '', description: '', duration: 14 });
        onTrendCreated?.();
      } else {
        toast.error(response.error || 'Failed to create trend');
      }
    } catch (error) {
      toast.error('Failed to create trend');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="w-full bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-3xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-gray-400 cursor-pointer group">
          <CardContent className="p-0 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Plus className="w-8 h-8 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Create New Trend</h3>
              <p className="text-gray-600 text-sm">Start a new trend and let others join</p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Trend</DialogTitle>
          <DialogDescription>
            Start a new trend for the community to participate in
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Trend Name *
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="name"
                placeholder="e.g., Minimalist Art"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="pl-10"
                maxLength={50}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtag" className="text-sm font-medium">
              Hashtag *
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="hashtag"
                placeholder="e.g., minimalart"
                value={formData.hashtag}
                onChange={(e) => handleInputChange('hashtag', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                className="pl-10"
                maxLength={30}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this trend is about..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">
              Duration (days)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="duration"
                type="number"
                min="1"
                max="30"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 14)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-black text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Trend'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}