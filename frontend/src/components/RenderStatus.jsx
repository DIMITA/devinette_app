import { useState, useEffect, useRef } from 'react'

const STATUS_LABELS = {
  pending: { label: 'En attente', color: 'text-yellow-400', icon: '⏳' },
  rendering: { label: 'Rendu en cours...', color: 'text-blue-400', icon: '🎬' },
  done: { label: 'Vidéo prête !', color: 'text-green-400', icon: '✅' },
  error: { label: 'Erreur de rendu', color: 'text-red-400', icon: '❌' },
}

export default function RenderStatus({ jobId, onDone }) {
  const [job, setJob] = useState(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const pollRef = useRef(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (!jobId) return
    startRef.current = Date.now()
    setElapsedSec(0)

    const poll = async () => {
      try {
        const res = await fetch(`/api/render/${jobId}`)
        if (!res.ok) return
        const data = await res.json()
        setJob(data)

        if (data.status === 'done' || data.status === 'error') {
          clearInterval(pollRef.current)
          if (data.status === 'done' && onDone) onDone(data)
        }
      } catch (_) {}
    }

    poll()
    pollRef.current = setInterval(() => {
      poll()
      setElapsedSec(Math.round((Date.now() - startRef.current) / 1000))
    }, 2000)

    return () => clearInterval(pollRef.current)
  }, [jobId])

  if (!job) return null

  const s = STATUS_LABELS[job.status] || STATUS_LABELS.pending

  return (
    <div className={`card border ${
      job.status === 'done' ? 'border-green-500/30' :
      job.status === 'error' ? 'border-red-500/30' :
      'border-blue-500/20'
    } animate-fade-in`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{s.icon}</span>
          <div>
            <p className={`font-bold ${s.color}`}>{s.label}</p>
            <p className="text-xs text-white/40 mt-0.5">Job {jobId?.slice(0, 8)}…</p>
          </div>
        </div>
        {(job.status === 'pending' || job.status === 'rendering') && (
          <span className="text-sm text-white/40">{elapsedSec}s</span>
        )}
      </div>

      {/* Progress bar for rendering */}
      {(job.status === 'pending' || job.status === 'rendering') && (
        <div className="mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-brand-orange rounded-full animate-pulse-fast"
              style={{ width: job.status === 'rendering' ? '60%' : '15%', transition: 'width 1s ease' }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2 text-center">
            {job.status === 'rendering'
              ? 'Composition et encodage MP4 en cours... (1-2 min)'
              : 'En attente du worker...'}
          </p>
        </div>
      )}

      {/* Error */}
      {job.status === 'error' && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
          {job.error || 'Une erreur inconnue est survenue'}
        </div>
      )}

      {/* Done — download */}
      {job.status === 'done' && job.downloadUrl && (
        <div className="space-y-3">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-sm text-green-300 text-center">
              🎉 Rendu terminé ! Vidéo MP4 1080×1920 prête
            </p>
          </div>
          <a
            href={job.downloadUrl}
            download
            className="btn-primary flex items-center justify-center gap-2 w-full"
          >
            <span>⬇️</span>
            Télécharger la vidéo MP4
          </a>
          <p className="text-xs text-white/30 text-center">
            Format TikTok 9:16 • 1080×1920 • H.264 • 30fps
          </p>
        </div>
      )}
    </div>
  )
}
