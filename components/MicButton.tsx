'use client'

import { useState, useRef } from 'react'

interface MicButtonProps {
  onTranscript: (text: string) => void
}

type AnyWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionInstance
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance
}

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionResultEvent {
  results: SpeechRecognitionResultList
}

export default function MicButton({ onTranscript }: MicButtonProps) {
  const [recording, setRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  function startRecording() {
    const win = window as AnyWindow
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser. Please type instead.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => (r as SpeechRecognitionResult)[0].transcript)
        .join('')
      onTranscript(transcript)
    }

    recognition.onerror = () => {
      setRecording(false)
    }

    recognition.onend = () => {
      setRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setRecording(false)
  }

  if (recording) {
    return (
      <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
        <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center animate-pulse mb-6">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
        <p className="text-white text-lg mb-2">Listening…</p>
        <p className="text-gray-400 text-sm mb-8">Speak your tasks</p>
        <button
          onClick={stopRecording}
          className="px-8 py-3 bg-white text-black rounded-full font-semibold text-base"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={startRecording}
      className="w-[72px] h-[72px] rounded-full bg-indigo-500 flex items-center justify-center mx-auto hover:bg-indigo-400 active:scale-95 transition-transform"
      aria-label="Start voice recording"
    >
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
      </svg>
    </button>
  )
}
