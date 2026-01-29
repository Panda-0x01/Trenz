import { NextResponse } from 'next/server';

export async function POST() {
  // In a more complex setup, you might want to blacklist the token
  // For now, we'll just return success and let the client handle token removal
  
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}