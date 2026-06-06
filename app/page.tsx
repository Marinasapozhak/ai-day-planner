'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MicButton = dynamic(() => import('@/components/MicButton'), { ssr: false })

export default function CapturePage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    try {
      await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      router.push('/inbox')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#111] flex flex-col px-4 py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Brain Dump</h1>
      <p className="text-gray-400 text-sm mb-6">
        Dump everything on your mind. AI will sort it out.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Call dentist tomorrow, finish report by Friday, buy groceries, fix the login bug ASAP…"
        className="flex-1 min-h-[220px] w-full bg-[#1a1a1a] text-white placeholder-gray-600 rounded-2xl p-4 text-base resize-none outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
      />

      <div className="flex flex-col items-center gap-4 mb-6">
        <p className="text-gray-500 text-sm">or speak</p>
        <MicButton onTranscript={setText} />
      </div>

      <button
        onClick={handleParse}
        disabled={!text.trim() || loading}
        className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white rounded-2xl font-semibold text-lg active:scale-95 transition-transform"
      >
        {loading ? 'Parsing…' : 'Parse →'}
      </button>
    </main>
  )
}
