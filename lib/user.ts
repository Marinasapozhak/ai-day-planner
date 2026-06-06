import { v4 as uuidv4 } from 'uuid'

export function getUserId(request: Request, responseHeaders: Headers): string {
  const cookieHeader = request.headers.get('cookie') || ''
  const existing = cookieHeader.match(/user_id=([^;]+)/)?.[1]
  if (existing) return existing
  const userId = uuidv4()
  responseHeaders.append(
    'Set-Cookie',
    `user_id=${userId}; HttpOnly; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax`
  )
  return userId
}
