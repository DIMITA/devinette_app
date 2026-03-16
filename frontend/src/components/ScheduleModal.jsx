import { useState } from 'react'
import { authFetch } from './TikTokConnect'

const PRIVACY_OPTIONS = [
  { value: 'SELF_ONLY',           label: '🔒 Privé (moi seulement)' },
  { value: 'MUTUAL_FOLLOW_FRIENDS', label: '👥 Amis mutuels' },
  { value: 'PUBLIC_TO_EVERYONE',  label: '🌍 Public' },
]

function pad(n) {
  return String(n).padStart(2, '0')
}

function toLocalDatetimeValue(date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

function getMinDatetime() {
  // Minimum = now + 5 minutes
  const d = new Date(Date.now() + 5 * 60 * 1000)
  return toLocalDatetimeValue(d)
}

export default function ScheduleModal({ jobId, questions, templateId, videoSettings, onClose, onScheduled }) {
  const defaultDate = new Date(Date.now() + 60 * 60 * 1000) // +1h
  const [scheduledAt, setScheduledAt] = useState(toLocalDatetimeValue(defaultDate))
  const [title, setTitle] = useState('')
  const [privacy, setPrivacy] = useState('SELF_ONLY')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      // Convert local datetime to UTC ISO
      const utcDate = new Date(scheduledAt).toISOString()

      const res = await authFetch('/api/schedule', {
        method: 'POST',
        body: JSON.stringify({
          render_job_id: jobId,
          template_id: templateId,
          questions,
          video_settings: videoSettings,
          title: title.trim() || null,
          privacy_level: privacy,
          scheduled_at: utcDate,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.detail || 'Erreur de planification')
      }

      const data = await res.json()
      onScheduled?.(data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-brand-dark border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">📅 Planifier la publication</h3>
            <p className="text-xs text-white/40 mt-0.5">{questions.length} question{questions.length > 1 ? 's' : ''} — {templateId}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white rounded-lg">✕</button>
        </div>

        {/* Date/time */}
        <div>
          <label className="label">🗓️ Date et heure de publication</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            min={getMinDatetime()}
            onChange={e => setScheduledAt(e.target.value)}
            className="input-field"
          />
          <p className="text-xs text-white/30 mt-1">Heure locale — conversion UTC automatique</p>
        </div>

        {/* Title */}
        <div>
          <label className="label">✏️ Titre TikTok <span className="text-white/30">(optionnel)</span></label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`Quiz DevinetteLab — ${questions.length} question${questions.length > 1 ? 's' : ''}`}
            className="input-field"
            maxLength={150}
          />
        </div>

        {/* Privacy */}
        <div>
          <label className="label">👁️ Visibilité</label>
          <div className="space-y-2">
            {PRIVACY_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  privacy === opt.value
                    ? 'border-brand-orange bg-brand-orange/10'
                    : 'border-white/10 bg-white/3 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value={opt.value}
                  checked={privacy === opt.value}
                  onChange={() => setPrivacy(opt.value)}
                  className="accent-brand-orange"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Planification...
              </>
            ) : '📅 Planifier'}
          </button>
        </div>
      </div>
    </div>
  )
}
