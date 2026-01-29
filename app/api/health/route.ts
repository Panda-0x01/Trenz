import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Get system info
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      database: 'connected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      features: {
        responsive: true,
        mobileMenu: true,
        authentication: true,
        fileUploads: true,
        realTimeMessages: false, // Update when WebSocket is implemented
      }
    };

    return NextResponse.json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'production' 
          ? 'Service unavailable' 
          : (error as Error).message,
      },
      { status: 503 }
    );
  }
}