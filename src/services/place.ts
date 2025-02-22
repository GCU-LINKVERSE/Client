import { CategoryData } from '@/types/category'
import { validatePlaceId } from '@/utils/validatePlaceId'
import { sendLikedStateRequest } from '@/utils/sendLikedStateRequest'
import { createRequestBody } from '@/utils/createRequestBody'
import { createToggleLikeUrl } from '@/utils/createToggleLikeUrl'
import { sendToggleLikeRequest } from '@/utils/sendToggleLikeRequest'
import { sendLikeCountRequest } from '@/utils/sendLikeCountRequest'
import { processLikeCountResponse } from '@/utils/processLikeCountResponse'
import { sendPlaceDataRequest } from '@/utils/sendPlaceDataRequest'
import { processPlaceDataResponse } from '@/utils/processPlaceDataResponse'
import { sendLoginRequest } from '@/utils/sendLoginRequest'
import { processLoginResponse } from '@/utils/processLoginResponse'
import { sendUserInfoRequest } from '@/utils/sendUserInfoRequest'
import { processUserInfoResponse } from '@/utils/processUserInfoResponse'
import { UserInfo } from '@/types/userInfo'
import { FetchFiltersResponse } from '@/types/filter'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const fetchCategoryData = async (
  categoryIndex: number,
  page: number,
): Promise<CategoryData[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/places/category/cardList/${categoryIndex}?page=${page}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    const result = await response.json()
    if (!result?.data.content || !Array.isArray(result.data.content)) {
      throw new Error('Invalid response format received from the API.')
    }

    return result.data.content
  } catch (error) {
    throw error
  }
}

export const fetchFilteredCategoryData = async (
  categoryIndex: number,
  page: number,
  filters: {
    filter1?: boolean
    filter2?: boolean
    filter3?: boolean
    filter4?: boolean
  },
): Promise<CategoryData[]> => {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append('category', String(categoryIndex))
    queryParams.append('page', String(page))

    Object.entries(filters).forEach(([key, value]) => {
      if (value == true) {
        queryParams.append(key, String(value))
      }
    })

    const url = `${API_BASE_URL}/api/places/category/cardList/${categoryIndex}/filters?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const result = await response.json()

    return result.data.content
  } catch (error) {
    console.log('error :', error)
    return []
  }
}

export const fetchLikedStates = async (placeId: string): Promise<boolean> => {
  try {
    validatePlaceId(placeId)

    const response = await sendLikedStateRequest(placeId)

    if (!response.ok) {
      console.error(
        `Failed to fetch liked state. HTTP Status: ${response.status}`,
      )
      return false
    }

    const data = await response.json()
    return data.data || false // liked 상태 반환
  } catch (error) {
    console.error('Error fetching liked state:', error)
    throw error
  }
}

export const toggleLike = async (
  placeId: number,
  liked: boolean,
): Promise<boolean> => {
  try {
    const url = createToggleLikeUrl(liked)
    const body = createRequestBody(placeId)

    const response = await sendToggleLikeRequest(url, body)

    if (!response.ok) {
      console.error(
        `Failed to toggle like status for placeId ${placeId}. HTTP Status: ${response.status}`,
      )
      throw new Error(
        `Failed to toggle like status. Status: ${response.status}`,
      )
    }

    return !liked
  } catch (error) {
    console.error(`Error toggling like for placeId ${placeId}:`, error)
    return liked
  }
}

export const fetchLikeCount = async (placeId: number): Promise<number> => {
  try {
    const response = await sendLikeCountRequest(placeId)

    if (!response.ok) {
      console.error(
        `Failed to fetch like count. HTTP Status: ${response.status}`,
      )
      throw new Error(`Failed to fetch like count. Status: ${response.status}`)
    }

    return await processLikeCountResponse(response)
  } catch (error) {
    console.error(`Error fetching like count for placeId ${placeId}:`, error)
    return 0
  }
}

export const fetchPlaceData = async (placeId: string) => {
  try {
    const response = await sendPlaceDataRequest(placeId)

    if (!response.ok) {
      console.error(
        `Failed to fetch place data. HTTP Status: ${response.status}`,
      )
      throw new Error(`Failed to fetch place data. Status: ${response.status}`)
    }

    return await processPlaceDataResponse(response)
  } catch (error) {
    console.error(`Error fetching place data for placeId ${placeId}:`, error)
    throw error // 에러 재발생
  }
}

export const fetchKakaoLoginUrl = async (): Promise<string> => {
  try {
    const response = await sendLoginRequest()

    // 응답 처리
    return await processLoginResponse(response)
  } catch (error) {
    console.error('요청 중 오류 발생:', error)
    throw new Error('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
  }
}

export const fetchUserInformation = async (): Promise<UserInfo> => {
  try {
    const response = await sendUserInfoRequest()

    // 응답 처리
    return await processUserInfoResponse(response)
  } catch (error) {
    console.error('Error fetching user information:', error)
    return { data: { userNickname: '알 수 없는 사용자' } }
  }
}

export const fetchFilters = async (): Promise<FetchFiltersResponse> => {
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.')
    throw new Error('Internal server error')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/places/filter`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch filters')
    }

    const result: FetchFiltersResponse = await response.json()
    return result
  } catch (error) {
    console.error('Error fetching filters:', error)
    throw new Error('Server error')
  }
}
