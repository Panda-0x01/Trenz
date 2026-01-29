'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import SuggestionsSidebar from '@/components/layout/SuggestionsSidebar';
import MobileNavigation from '@/components/layout/MobileNavigation';
import MobileHeader from '@/components/layout/MobileHeader';
import { User } from '@/types';
import api from '@/lib/api';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Try to get user info with current token
        const response = await api.request('/auth/me');
        
        if (response.success && response.data) {
          setUser(response.data as User);
          // Store current user globally
          if (typeof window !== 'undefined') {
            (window as any).currentUser = response.data;
          }
        } else {
          // Try to refresh token
          const refreshResponse = await api.refreshToken();
          
          if (refreshResponse.success && refreshResponse.data?.tokens) {
            api.setToken(refreshResponse.data.tokens.accessToken);
            localStorage.setItem('refreshToken', refreshResponse.data.tokens.refreshToken);
            
            // Retry getting user info
            const userResponse = await api.request('/auth/me');
            if (userResponse.success && userResponse.data) {
              setUser(userResponse.data as User);
              if (typeof window !== 'undefined') {
                (window as any).currentUser = userResponse.data;
              }
            } else {
              router.push('/login');
            }
          } else {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader user={user || undefined} showSearch={true} />

      {/* Desktop Layout (lg and above) */}
      <div className="lg:flex">
        {/* Left Sidebar - Desktop only */}
        <div className="hidden lg:block">
          <Sidebar user={user || undefined} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 lg:pr-80">
          <main className="min-h-screen pb-16 lg:pb-0">
            <div className="max-w-2xl mx-auto py-4 px-4 lg:py-8 lg:px-0">
              {children}
            </div>
          </main>
        </div>
        
        {/* Right Sidebar - Desktop only */}
        <div className="hidden lg:block">
          <SuggestionsSidebar currentUser={user || undefined} />
        </div>
      </div>

      {/* Tablet Layout (md to lg) */}
      <div className="hidden md:block lg:hidden">
        <Sidebar user={user || undefined} isCollapsed={true} />
        <div className="pl-20">
          <main className="min-h-screen pb-16">
            <div className="max-w-3xl mx-auto py-6 px-4">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileNavigation user={user || undefined} />
      </div>
    </div>
  );
}