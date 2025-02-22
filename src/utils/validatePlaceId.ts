export const validatePlaceId = (placeId: string): void => {
  if (!placeId) {
    throw new Error('placeId is required to fetch liked state.')
  }
}
