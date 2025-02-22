import { Place } from '@/types/place'

export const processPlaceDataResponse = (
  response: Response,
): Promise<Place> => {
  return response.json().then((result) => {
    if (!result.data) {
      console.error('Invalid response format:', result)
      throw new Error('Invalid place data response format.')
    }
    return result.data
  })
}
