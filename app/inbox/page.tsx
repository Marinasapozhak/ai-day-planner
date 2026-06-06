'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TaskCard from '@/components/TaskCard'

interface Task {
  id: string
  text: string
  priority: 'must' | 'nice'
  duration_min: number
  deadline: string | null
}

const DAY_LABELS = ['Today', 'Tomorrow', 'In 2 days', 'In 3 days', 'In 4 days', 'In 5 days', 'In 6 days']

function dateFromOffset(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export default function InboxPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduling, setScheduling] = useState<string | null>(null) // task id being scheduled

  useEffect(() => {
    fetch('/api/tasks?status=inbox')
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks || []))
      .finally(() => setLoading(false))
  }, [])

  async function handleSchedule(taskId: string, dayOffset: number) {
    const date = dateFromOffset(dayOffset)

    // find last scheduled end on that day, start after it (default 9:00)
    const res = await fetch(`/api/tasks/last-end?date=${date}`)
    const { lastEnd } = await res.json()

    const startDate = lastEnd ? new Date(lastEnd) : (() => {
      const d = new Date(`${date}T09:00:00`)
      return d
    })()

    const task = tasks.find((t) => t.id === taskId)!
    const endDate = new Date(startDate.getTime() + task.duration_min * 60 * 1000)

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'today',
        scheduled_date: date,
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
      }),
    })

    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setScheduling(null)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <main className="min-h-screen bg-[#111] flex flex-col px-5 pt-14 pb-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Inbox</h1>
        <Link href="/" className="text-indigo-400 text-sm">+ Add more</Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-16">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <p className="text-gray-400 text-lg">All clear!</p>
          <Link href="/week" className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-semibold">
            View Week →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} to schedule
          </p>
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <div key={task.id}>
                <TaskCard
                  task={task}
                  onAddToday={() => setScheduling(scheduling === task.id ? null : task.id)}
                  onDelete={handleDelete}
                  scheduling={scheduling === task.id}
                />
                {scheduling === task.id && (
                  <div className="mt-2 bg-[#222] rounded-2xl p-3 flex flex-col gap-2">
                    <p className="text-gray-400 text-xs mb-1">Schedule for:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DAY_LABELS.map((label, i) => (
                        <button
                          key={i}
                          onClick={() => handleSchedule(task.id, i)}
                          className="py-2.5 bg-[#1a1a1a] hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors"
                        >
                          {label}
                          <span className="block text-xs text-gray-400 mt-0.5">
                            {new Date(Date.now() + i * 86400000).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Link href="/week" className="mt-6 block text-center py-3 text-indigo-400 font-medium">
            View Week →
          </Link>
        </>
      )}
    </main>
  )
}
