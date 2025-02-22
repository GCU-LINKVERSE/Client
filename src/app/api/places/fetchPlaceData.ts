import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(
  req: Request,
  { params }: { params: { placeId: string } },
) {
  const { placeId } = params

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
      { success: false, error: 'placeId is required to fetch place data' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/places/${placeId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      console.error(
        `Failed to fetch place data. HTTP Status: ${response.status}`,
      )
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch place data. Status: ${response.status}`,
        },
        { status: response.status },
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error fetching place data:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    )
  }
}
