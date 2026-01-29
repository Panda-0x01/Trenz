'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trend } from '@/types';

interface TrendCardProps {
  trend: Trend;
  showJoinButton?: boolean;
  onJoin?: (trendId: number) => void;
}

export default function TrendCard({ trend, showJoinButton = true, onJoin }: TrendCardProps) {
  const isActive = trend.isActive && new Date(trend.endDate) > new Date();
  const daysLeft = isActive ? Math.ceil((new Date(trend.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const daysAgo = Math.floor((Date.now() - new Date(trend.startDate).getTime()) / (1000 * 60 * 60 * 24));

  const handleJoin = () => {
    onJoin?.(trend.id);
  };

  // Calculate progress percentage
  const totalDuration = new Date(trend.endDate).getTime() - new Date(trend.startDate).getTime();
  const elapsed = Date.now() - new Date(trend.startDate).getTime();
  const progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

  return (
    <Card className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6 space-y-5">
        {/* Header with Title and Join Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-3 break-words">
              {trend.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                #{trend.hashtag}
              </Badge>
              {isActive ? (
                <Badge className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border-0 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Active
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium border-0">
                  Ended
                </Badge>
              )}
            </div>
          </div>
          
          {showJoinButton && isActive && (
            <Button 
              className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shrink-0"
              onClick={handleJoin} 
              asChild
            >
              <Link href={`/create?trend=${trend.id}`}>
                Join Trend
              </Link>
            </Button>
          )}
        </div>

        {/* Description */}
        {trend.description && (
          <p className="text-gray-600 text-base leading-relaxed break-words">
            {trend.description}
          </p>
        )}

        {/* Timeline Section */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>Started {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago</span>
          <span>Ends in {daysLeft} days</span>
        </div>

        {/* Progress bar */}
        {isActive && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gray-900 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(5, progressPercentage)}%`
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}