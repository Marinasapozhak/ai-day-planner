'use client'

interface Task {
  id: string
  text: string
  priority: 'must' | 'nice'
  duration_min: number
  deadline: string | null
}

interface TaskCardProps {
  task: Task
  onAddToday: (id: string) => void
  onDelete: (id: string) => void
  scheduling?: boolean
}

export default function TaskCard({ task, onAddToday, onDelete, scheduling }: TaskCardProps) {
  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No deadline'

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 w-full">
      <div className="flex items-start gap-3 mb-3">
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
            task.priority === 'must'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-purple-500/20 text-purple-400'
          }`}
        >
          {task.priority}
        </span>
        <p className="text-white text-base leading-snug">{task.text}</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span>⏱ {task.duration_min} min</span>
        <span>📅 {deadline}</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onAddToday(task.id)}
          className={`flex-1 py-2.5 text-white rounded-xl font-medium text-sm active:scale-95 transition-all ${
            scheduling ? 'bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-400'
          }`}
        >
          {scheduling ? 'Pick a day ↓' : 'Schedule'}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex-1 py-2.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-400 rounded-xl font-medium text-sm active:scale-95 transition-transform"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
