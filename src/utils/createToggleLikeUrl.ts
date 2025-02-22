const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const createToggleLikeUrl = (liked: boolean): string => {
  return liked
    ? `${API_BASE_URL}/api/place/like/unlike`
    : `${API_BASE_URL}/api/place/like/like`
}
