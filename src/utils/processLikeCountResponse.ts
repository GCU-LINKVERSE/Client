export const processLikeCountResponse = (
  response: Response,
): Promise<number> => {
  return response.json().then((result) => {
    // 데이터가 숫자인지 확인
    if (typeof result.data === 'number') {
      return result.data
    } else {
      console.error('Invalid response format:', result)
      throw new Error('Invalid like count response format.')
    }
  })
}
