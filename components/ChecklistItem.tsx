'use client'

interface Task {
  id: string
  text: string
  priority: 'must' | 'nice'
  duration_min: number
  status: string
}

interface ChecklistItemProps {
  task: Task
  onDone: (id: string) => void
}

export default function ChecklistItem({ task, onDone }: ChecklistItemProps) {
  const isDone = task.status === 'done'

  return (
    <button
      onClick={() => !isDone && onDone(task.id)}
      className={`w-full flex items-center gap-4 bg-[#1a1a1a] rounded-2xl p-4 text-left active:scale-[0.98] transition-transform ${
        isDone ? 'opacity-50' : ''
      }`}
    >
      <div
        className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
          isDone ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600'
        }`}
      >
        {isDone && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-base ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
          {task.text}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">⏱ {task.duration_min} min</p>
      </div>
      <span
        className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
          task.priority === 'must'
            ? 'bg-red-500/20 text-red-400'
            : 'bg-purple-500/20 text-purple-400'
        }`}
      >
        {task.priority}
      </span>
    </button>
  )
}
