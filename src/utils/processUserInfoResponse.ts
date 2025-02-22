import { UserInfo } from '@/types/userInfo'

export const processUserInfoResponse = async (
  response: Response,
): Promise<UserInfo> => {
  if (!response.ok) {
    console.error(
      `Failed to fetch user information. HTTP Status: ${response.status}`,
    )
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  if (!data || typeof data !== 'object') {
    console.error('Invalid response format received:', data)
    throw new Error('Invalid response format received.')
  }

  return data
}
