'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Task {
  id: string
  text: string
  priority: 'must' | 'nice'
  duration_min: number
  status: string
  scheduled_start: string | null
  scheduled_end: string | null
  scheduled_date: string | null
}

const HOUR_START = 8   // 8:00
const HOUR_END = 22    // 22:00
const TOTAL_HOURS = HOUR_END - HOUR_START
const PX_PER_HOUR = 64

function dateFromOffset(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function topPx(iso: string): number {
  const d = new Date(iso)
  const hours = d.getHours() + d.getMinutes() / 60
  return (hours - HOUR_START) * PX_PER_HOUR
}

function heightPx(start: string, end: string): number {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000
  return Math.max(diff * PX_PER_HOUR, 32)
}

export default function WeekPage() {
  const [selectedOffset, setSelectedOffset] = useState(0)
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)

  const selectedDate = dateFromOffset(selectedOffset)

  const loadDay = useCallback(async (offset: number) => {
    const date = dateFromOffset(offset)
    if (tasksByDate[date]) return
    setLoading(true)
    const res = await fetch(`/api/tasks?date=${date}`)
    const { tasks } = await res.json()
    setTasksByDate((prev) => ({ ...prev, [date]: tasks || [] }))
    setLoading(false)
  }, [tasksByDate])

  useEffect(() => { loadDay(selectedOffset) }, [selectedOffset, loadDay])

  async function markDone(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    })
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map((t) =>
        t.id === task.id ? { ...t, status: 'done' } : t
      ),
    }))
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      offset: i,
      date: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' }),
      num: d.getDate(),
    }
  })

  const tasks = tasksByDate[selectedDate] || []
  const done = tasks.filter((t) => t.status === 'done').length
  const total = tasks.length

  return (
    <main className="min-h-screen bg-[#111] flex flex-col w-full">
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Week</h1>
          <Link href="/" className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xl font-light">
            +
          </Link>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {days.map((day) => (
            <button
              key={day.offset}
              onClick={() => setSelectedOffset(day.offset)}
              className={`flex flex-col items-center shrink-0 w-12 py-2 rounded-2xl transition-colors ${
                selectedOffset === day.offset
                  ? 'bg-indigo-500 text-white'
                  : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              <span className="text-xs">{day.label}</span>
              <span className="text-base font-bold">{day.num}</span>
            </button>
          ))}
        </div>

        {total > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{done}/{total}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {loading ? (
          <p className="text-gray-500 text-center py-16">Loading…</p>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <p className="text-gray-500">Nothing scheduled</p>
            <Link href="/inbox" className="text-indigo-400 text-sm">← Go to Inbox</Link>
          </div>
        ) : (
          <div
            className="relative"
            style={{ height: `${TOTAL_HOURS * PX_PER_HOUR}px` }}
          >
            {/* Hour grid lines */}
            {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 flex items-center gap-2"
                style={{ top: `${i * PX_PER_HOUR}px` }}
              >
                <span className="text-xs text-gray-600 w-10 shrink-0">
                  {String(HOUR_START + i).padStart(2, '0')}:00
                </span>
                <div className="flex-1 border-t border-[#222]" />
              </div>
            ))}

            {/* Task blocks */}
            {tasks.map((task) => {
              if (!task.scheduled_start || !task.scheduled_end) return null
              const top = topPx(task.scheduled_start)
              const height = heightPx(task.scheduled_start, task.scheduled_end)
              const isDone = task.status === 'done'

              return (
                <button
                  key={task.id}
                  onClick={() => !isDone && markDone(task)}
                  className={`absolute left-14 right-0 rounded-xl px-3 py-2 text-left transition-opacity ${
                    task.priority === 'must'
                      ? isDone ? 'bg-red-500/20' : 'bg-red-500/40 active:bg-red-500/60'
                      : isDone ? 'bg-indigo-500/20' : 'bg-indigo-500/40 active:bg-indigo-500/60'
                  } ${isDone ? 'opacity-50' : ''}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <p className={`text-sm font-medium leading-tight ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                    {task.text}
                  </p>
                  {height >= 44 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatTime(task.scheduled_start)} – {formatTime(task.scheduled_end)}
                    </p>
                  )}
                  {isDone && (
                    <span className="absolute top-2 right-2 text-xs text-gray-500">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
