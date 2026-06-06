import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserId } from '@/lib/user'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const responseHeaders = new Headers()
  const userId = getUserId(request, responseHeaders)
  const body = await request.json()
  const { id } = await params
  const { status, scheduled_date, scheduled_start, scheduled_end } = body

  await sql`
    UPDATE tasks SET
      status = COALESCE(${status ?? null}, status),
      scheduled_date = COALESCE(${scheduled_date ?? null}::date, scheduled_date),
      scheduled_start = COALESCE(${scheduled_start ?? null}::timestamptz, scheduled_start),
      scheduled_end = COALESCE(${scheduled_end ?? null}::timestamptz, scheduled_end)
    WHERE id = ${id} AND user_id = ${userId}
  `

  const response = NextResponse.json({ ok: true })
  responseHeaders.forEach((value, key) => response.headers.append(key, value))
  return response
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const responseHeaders = new Headers()
  const userId = getUserId(request, responseHeaders)
  const { id } = await params

  await sql`
    DELETE FROM tasks WHERE id = ${id} AND user_id = ${userId}
  `

  const response = NextResponse.json({ ok: true })
  responseHeaders.forEach((value, key) => response.headers.append(key, value))
  return response
}
