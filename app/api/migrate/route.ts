import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_date DATE`
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ`
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ`
  return NextResponse.json({ ok: true, message: 'Migration complete' })
}
