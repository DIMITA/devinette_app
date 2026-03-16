import { useState, useRef } from 'react'

const VOICES = [
  { value: 'fr',    label: '🇫🇷 Français',             desc: 'Voix française standard' },
  { value: 'fr-CA', label: '🇨🇦 Français québécois',   desc: 'Accent canadien-français' },
  { value: 'en',    label: '🇺🇸 English (US)',          desc: 'American English voice' },
  { value: 'en-GB', label: '🇬🇧 English (British)',     desc: 'British English voice' },
  { value: 'en-AU', label: '🇦🇺 English (Australian)',  desc: 'Australian English voice' },
  { value: 'es',    label: '🇪🇸 Español',               desc: 'Voz española estándar' },
  { value: 'es-MX', label: '🇲🇽 Español (México)',      desc: 'Voz mexicana' },
  { value: 'ar',    label: '🇸🇦 العربية',               desc: 'الصوت العربي' },
  { value: 'de',    label: '🇩🇪 Deutsch',               desc: 'Deutsche Stimme' },
  { value: 'pt-BR', label: '🇧🇷 Português (Brasil)',    desc: 'Voz brasileira' },
  { value: 'it',    label: '🇮🇹 Italiano',              desc: 'Voce italiana' },
  { value: 'ru',    label: '🇷🇺 Русский',               desc: 'Русский голос' },
  { value: 'ja',    label: '🇯🇵 日本語',                 desc: '日本語の音声' },
  { value: 'zh',    label: '🇨🇳 中文',                   desc: '中文语音' },
]

/**
 * VoicePicker — select a TTS voice, preview it, then confirm.
 * Props:
 *   value: string         — currently selected voice code
 *   onChange: (v) => void — called when user changes selection
 */
export default function VoicePicker({ value, onChange }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  const selected = VOICES.find(v => v.value === value) || VOICES[0]

  const handlePreview = async () => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }
    setError(null)
    setIsPlaying(true)
    try {
      const url = `/api/tts/preview?voice=${encodeURIComponent(value)}`
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        setIsPlaying(false)
        setError('Prévisualisation impossible')
      }
      await audio.play()
    } catch {
      setIsPlaying(false)
      setError('Prévisualisation impossible')
    }
  }

  return (
    <div className="space-y-3">
      <label className="label">🎙️ Voix de narration</label>

      <div className="flex gap-2">
        {/* Select */}
        <select
          value={value}
          onChange={e => {
            // Stop current playback when changing voice
            if (audioRef.current) {
              audioRef.current.pause()
              setIsPlaying(false)
            }
            onChange(e.target.value)
            setError(null)
          }}
          className="select-field flex-1"
        >
          {VOICES.map(v => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>

        {/* Preview button */}
        <button
          type="button"
          onClick={handlePreview}
          title={isPlaying ? 'Arrêter' : `Écouter ${selected.label}`}
          className={`px-4 py-2 rounded-xl border font-semibold text-sm transition-all flex items-center gap-2 shrink-0 ${
            isPlaying
              ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/30'
              : 'bg-white/5 border-white/15 text-white/70 hover:border-white/30 hover:text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
              Stop
            </>
          ) : (
            <>▶ Écouter</>
          )}
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-white/40 pl-1">{selected.desc}</p>

      {error && (
        <p className="text-xs text-red-400">⚠️ {error}</p>
      )}
    </div>
  )
}
