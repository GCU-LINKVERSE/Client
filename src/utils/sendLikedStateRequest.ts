const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const sendLikedStateRequest = async (
  placeId: string,
): Promise<Response> => {
  const url = `${API_BASE_URL}/api/place/like/places/${placeId}/liked`

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // 쿠키 포함
  })

  return response
}
