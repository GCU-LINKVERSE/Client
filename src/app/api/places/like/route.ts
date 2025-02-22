import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(req: Request) {
  const { placeId, liked } = await req.json()

  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.')
    return NextResponse.json(
      { success: false, error: 'API_BASE_URL is not configured' },
      { status: 500 },
    )
  }

  if (!placeId || typeof liked !== 'boolean') {
    console.error('Invalid placeId or liked status:', { placeId, liked })
    return NextResponse.json(
      { success: false, error: 'placeId and liked status are required' },
      { status: 400 },
    )
  }

  try {
    const url = liked
      ? `${API_BASE_URL}/api/place/like/unlike`
      : `${API_BASE_URL}/api/place/like/like`

    const body = new URLSearchParams()
    body.append('placeId', placeId.toString())

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: body.toString(),
    })

    if (!response.ok) {
      console.error(
        `Failed to toggle like status for placeId ${placeId}. HTTP Status: ${response.status}`,
      )
      return NextResponse.json(
        {
          success: false,
          error: `Failed to toggle like status. Status: ${response.status}`,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, data: !liked })
  } catch (error) {
    console.error('Error toggling like status:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    )
  }
}
