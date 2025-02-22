import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(req: NextRequest) {
  // categoryIndex를 안전하게 추출하도록 수정
  const categoryIndex = req.nextUrl.pathname.split('/').pop() as
    | string
    | undefined

  if (!categoryIndex) {
    return NextResponse.json(
      { success: false, error: 'Category index is missing' },
      { status: 400 },
    )
  }

  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/places/category/${categoryIndex}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch category data' },
        { status: response.status },
      )
    }

    const result = await response.json()
    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error fetching category data:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    )
  }
}
