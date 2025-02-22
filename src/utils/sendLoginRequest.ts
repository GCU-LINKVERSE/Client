const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const sendLoginRequest = async (): Promise<Response> => {
  const url = `${API_BASE_URL}/api/start-login`

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  return response
}
