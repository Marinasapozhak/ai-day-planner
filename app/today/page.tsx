'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ChecklistItem from '@/components/ChecklistItem'

interface Task {
  id: string
  text: string
  priority: 'must' | 'nice'
  duration_min: number
  status: string
}

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks?status=today')
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks || []))
      .finally(() => setLoading(false))
  }, [])

  async function handleDone(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    })
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'done' } : t))
    )
  }

  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <main className="min-h-screen bg-[#111] flex flex-col px-5 pt-14 pb-24 w-full">
      <h1 className="text-2xl font-bold text-white mb-1">Today</h1>
      <p className="text-gray-400 text-sm mb-4">
        {done} of {total} done
      </p>

      {total > 0 && (
        <div className="w-full h-2 bg-[#1a1a1a] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-16">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <p className="text-gray-400 text-lg">Nothing planned yet</p>
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-semibold"
          >
            Brain dump →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <ChecklistItem key={task.id} task={task} onDone={handleDone} />
          ))}
        </div>
      )}

      <Link
        href="/"
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full flex items-center justify-center shadow-lg text-2xl font-light active:scale-95 transition-transform"
        aria-label="Brain dump"
      >
        +
      </Link>
    </main>
  )
}
