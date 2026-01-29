'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Calendar, Hash, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function CreateTrendPage() {
  const [formData, setFormData] = useState({
    name: '',
    hashtag: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHashtagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove # if user types it
    if (value.startsWith('#')) {
      value = value.substring(1);
    }
    // Only allow alphanumeric characters and underscores
    value = value.replace(/[^a-zA-Z0-9_]/g, '');
    
    setFormData(prev => ({
      ...prev,
      hashtag: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.hashtag.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.startDate) {
      toast.error('Please select a start date');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const trendData = {
        name: formData.name.trim(),
        hashtag: formData.hashtag.trim(),
        description: formData.description.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      const response = await api.request('/trends/create', {
        method: 'POST',
        body: JSON.stringify(trendData),
      });

      if (response.success) {
        toast.success('Trend created successfully!');
        router.push('/trends');
      } else {
        toast.error(response.error || 'Failed to create trend');
      }
    } catch (error) {
      console.error('Create trend error:', error);
      toast.error('Failed to create trend');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex items-center space-x-3 md:space-x-4">
          <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
            <Link href="/trends">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Create New Trend</h1>
            <p className="text-gray-600 text-sm md:text-base">Start a trending competition and get the community involved</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
            <span>Trend Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Trend Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Trend Name *</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Summer Vibes Challenge"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500">
                Give your trend a catchy, descriptive name
              </p>
            </div>

            {/* Hashtag */}
            <div className="space-y-2">
              <Label htmlFor="hashtag" className="flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>Hashtag *</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  #
                </span>
                <Input
                  id="hashtag"
                  name="hashtag"
                  value={formData.hashtag}
                  onChange={handleHashtagChange}
                  placeholder="SummerVibes"
                  className="pl-8"
                  maxLength={50}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Create a unique hashtag for your trend (letters, numbers, and underscores only)
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what your trend is about, what kind of content you're looking for, and any rules or guidelines..."
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Start Date *</span>
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                min={today}
                required
              />
              <p className="text-xs text-gray-500">
                When should this trend start?
              </p>
            </div>

            {/* End Date (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date (Optional)
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || today}
              />
              <p className="text-xs text-gray-500">
                Leave empty for an ongoing trend, or set an end date for a limited-time challenge
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Creating...' : 'Create Trend'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips for Creating Great Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Make your trend name catchy and easy to remember</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Choose a unique hashtag that's not already in use</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Provide clear guidelines about what kind of content you're looking for</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Consider seasonal themes or current events for better engagement</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Engage with participants by liking and commenting on their posts</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}