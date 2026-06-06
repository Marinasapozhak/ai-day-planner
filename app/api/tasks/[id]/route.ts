import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserId } from '@/lib/user'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const responseHeaders = new Headers()
  const userId = getUserId(request, responseHeaders)
  const { status } = await request.json()
  const { id } = await params

  await sql`
    UPDATE tasks SET status = ${status}
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
