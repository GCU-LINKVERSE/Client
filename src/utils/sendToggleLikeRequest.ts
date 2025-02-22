export const sendToggleLikeRequest = async (
  url: string,
  body: URLSearchParams,
): Promise<Response> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    credentials: 'include', // 쿠키 포함
    body: body.toString(),
  })

  return response
}
