import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.pathname.split('/').pop() // 경로에서 placeId 추출

  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.')
    return NextResponse.json(
      { success: false, error: 'API_BASE_URL is not configured' },
      { status: 500 },
    )
  }

  if (!placeId) {
    console.error('Invalid placeId:', placeId)
    return NextResponse.json(
      { success: false, error: 'placeId is required to fetch liked state.' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/place/like/places/${placeId}/liked`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 포함
      },
    )

    if (!response.ok) {
      console.error(
        `Failed to fetch liked state. HTTP Status: ${response.status}`,
      )
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch liked state. Status: ${response.status}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data.data || false, // liked 상태 반환
    })
  } catch (error) {
    console.error('Error fetching liked state:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    )
  }
}
