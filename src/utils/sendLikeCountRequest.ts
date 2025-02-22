const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const sendLikeCountRequest = async (
  placeId: number,
): Promise<Response> => {
  const url = `${API_BASE_URL}/api/places/like/${placeId}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  return response
}
