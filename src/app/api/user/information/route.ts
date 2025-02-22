import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET() {
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.')
    return NextResponse.json(
      { success: false, error: 'API_BASE_URL is not configured' },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/user/information`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!response.ok) {
      console.error(
        `Failed to fetch user information. HTTP Status: ${response.status}`,
      )
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch user information. Status: ${response.status}`,
        },
        { status: response.status },
      )
    }

    const result = await response.json()

    if (!result || typeof result !== 'object') {
      console.error('Invalid response format received:', result)
      return NextResponse.json(
        { success: false, error: 'Invalid response format received' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error fetching user information:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    )
  }
}
