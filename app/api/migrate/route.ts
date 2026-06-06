import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      text TEXT NOT NULL,
      priority VARCHAR(4) CHECK (priority IN ('must', 'nice')) NOT NULL,
      duration_min INTEGER NOT NULL,
      deadline TIMESTAMPTZ,
      status VARCHAR(10) CHECK (status IN ('inbox', 'today', 'done')) NOT NULL DEFAULT 'inbox',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS tasks_user_status ON tasks(user_id, status)
  `
  return NextResponse.json({ ok: true, message: 'Migration complete' })
}
