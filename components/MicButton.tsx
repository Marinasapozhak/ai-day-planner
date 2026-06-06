'use client'

import { useState, useRef, useEffect } from 'react'

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
  abort(): void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionResultEvent {
  results: SpeechRecognitionResultList
}

const MicIcon = () => (
  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
)

export default function MicButton({ onTranscript }: MicButtonProps) {
  const [recording, setRecording] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const stoppedManually = useRef(false)
  const finalTextRef = useRef('')

  // Cleanup on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.abort() }
  }, [])

  function createRecognition() {
    const win = window as AnyWindow
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let final = ''
      let interimText = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = (event.results as unknown as SpeechRecognitionResult[])[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interimText += result[0].transcript
        }
      }
      if (final) {
        finalTextRef.current = final
        onTranscript(final.trim())
      }
      setInterim(interimText)
    }

    recognition.onerror = (event) => {
      // 'no-speech' is normal — ignore it, recognition will auto-restart via onend
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow mic in browser settings.')
        stoppedManually.current = true
        setRecording(false)
      }
    }

    // onend fires after silence or network pause — restart unless user stopped manually
    recognition.onend = () => {
      if (!stoppedManually.current) {
        try { recognition.start() } catch { /* already started */ }
      } else {
        setRecording(false)
        setInterim('')
      }
    }

    return recognition
  }

  function startRecording() {
    setError('')
    const win = window as AnyWindow
    if (!win.SpeechRecognition && !win.webkitSpeechRecognition) {
      setError('Voice input not supported in this browser.')
      return
    }

    stoppedManually.current = false
    finalTextRef.current = ''
    const recognition = createRecognition()!
    recognitionRef.current = recognition
    try {
      recognition.start()
      setRecording(true)
    } catch {
      setError('Could not start microphone.')
    }
  }

  function stopRecording() {
    stoppedManually.current = true
    recognitionRef.current?.stop()
    setRecording(false)
    setInterim('')
  }

  if (recording) {
    return (
      <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 px-8">
        {/* Animated mic */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-red-500 flex items-center justify-center">
            <MicIcon />
          </div>
        </div>

        <p className="text-white text-xl font-semibold mb-2">Listening…</p>
        <p className="text-gray-500 text-sm mb-6">Speak freely, tap Done when finished</p>

        {/* Interim transcript preview */}
        {interim && (
          <div className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl px-4 py-3 mb-6">
            <p className="text-gray-300 text-base italic">{interim}</p>
          </div>
        )}
        {!interim && finalTextRef.current && (
          <div className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl px-4 py-3 mb-6">
            <p className="text-gray-400 text-sm">✓ Captured — keep talking or tap Done</p>
          </div>
        )}

        <button
          onClick={stopRecording}
          className="px-10 py-4 bg-white text-black rounded-full font-semibold text-base active:scale-95 transition-transform"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={startRecording}
        className="w-[72px] h-[72px] rounded-full bg-indigo-500 flex items-center justify-center mx-auto hover:bg-indigo-400 active:scale-95 transition-transform"
        aria-label="Start voice recording"
      >
        <MicIcon />
      </button>
      {error && <p className="text-red-400 text-xs text-center max-w-[200px]">{error}</p>}
    </div>
  )
}
