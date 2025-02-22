export const processLoginResponse = async (
  response: Response,
): Promise<string> => {
  if (!response.ok) {
    console.error('로그인 URL 요청 실패:', response.status, response.statusText)
    throw new Error('로그인 요청이 실패했습니다.')
  }

  const kakaoLoginUrl = await response.text()
  return kakaoLoginUrl
}
