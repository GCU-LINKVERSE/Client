export const createRequestBody = (placeId: number): URLSearchParams => {
  const body = new URLSearchParams()
  body.append('placeId', placeId.toString())
  return body
}
