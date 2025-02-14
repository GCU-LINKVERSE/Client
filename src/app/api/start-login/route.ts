// src/app/api/start-login/route.ts
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.');
    return NextResponse.json(
      { success: false, error: 'API_BASE_URL is not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/start-login`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
    });

    if (!response.ok) {
      console.error(`Failed to fetch login URL. HTTP Status: ${response.status}`);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch login URL' },
        { status: response.status }
      );
    }

    const kakaoLoginUrl = await response.text(); 
    return NextResponse.json({
      success: true,
      data: kakaoLoginUrl, 
    });
  } catch (error) {
    console.error('Error fetching login URL:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}