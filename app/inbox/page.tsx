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

export default function InboxPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks?status=inbox')
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks || []))
      .finally(() => setLoading(false))
  }, [])

  async function handleAddToday(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'today' }),
    })
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <main className="min-h-screen bg-[#111] flex flex-col px-5 pt-14 pb-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Inbox</h1>
        <Link href="/" className="text-indigo-400 text-sm">
          + Add more
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-16">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <p className="text-gray-400 text-lg">All clear!</p>
          <Link
            href="/today"
            className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-semibold"
          >
            View Today →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} to review
          </p>
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onAddToday={handleAddToday}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <Link
            href="/today"
            className="mt-6 block text-center py-3 text-indigo-400 font-medium"
          >
            View Today →
          </Link>
        </>
      )}
    </main>
  )
}
