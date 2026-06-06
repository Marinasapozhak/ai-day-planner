import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserId } from '@/lib/user'

export async function GET(request: NextRequest) {
  const responseHeaders = new Headers()
  const userId = getUserId(request, responseHeaders)

  const status = request.nextUrl.searchParams.get('status') || 'inbox'
  const date = request.nextUrl.searchParams.get('date') // YYYY-MM-DD

  let rows
  if (date) {
    ;({ rows } = await sql`
      SELECT * FROM tasks
      WHERE user_id = ${userId} AND scheduled_date = ${date}
      ORDER BY scheduled_start ASC NULLS LAST, created_at ASC
    `)
  } else {
    ;({ rows } = await sql`
      SELECT * FROM tasks
      WHERE user_id = ${userId} AND status = ${status}
      ORDER BY created_at ASC
    `)
  }

  const response = NextResponse.json({ tasks: rows })
  responseHeaders.forEach((value, key) => {
    response.headers.append(key, value)
  })
  return response
}
