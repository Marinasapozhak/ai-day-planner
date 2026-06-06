import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserId } from '@/lib/user'

export async function GET(request: NextRequest) {
  const responseHeaders = new Headers()
  const userId = getUserId(request, responseHeaders)
  const date = request.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ lastEnd: null })

  const { rows } = await sql`
    SELECT scheduled_end FROM tasks
    WHERE user_id = ${userId} AND scheduled_date = ${date}
      AND scheduled_end IS NOT NULL
    ORDER BY scheduled_end DESC
    LIMIT 1
  `

  const response = NextResponse.json({ lastEnd: rows[0]?.scheduled_end ?? null })
  responseHeaders.forEach((v, k) => response.headers.append(k, v))
  return response
}
