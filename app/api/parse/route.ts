import { NextRequest, NextResponse } from 'next/server'
import { parseBrainDump } from '@/lib/claude'
import { sql } from '@/lib/db'
import { getUserId } from '@/lib/user'

export async function POST(request: NextRequest) {
  const responseHeaders = new Headers()
  const userId = getUserId(request, responseHeaders)

  const { text } = await request.json()
  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }

  const tasks = await parseBrainDump(text)

  for (const task of tasks) {
    await sql`
      INSERT INTO tasks (user_id, text, priority, duration_min, deadline, status)
      VALUES (
        ${userId},
        ${task.text},
        ${task.priority},
        ${task.duration_min},
        ${task.deadline ?? null},
        'inbox'
      )
    `
  }

  const response = NextResponse.json({ tasks }, { headers: responseHeaders })
  responseHeaders.forEach((value, key) => {
    response.headers.append(key, value)
  })
  return response
}
