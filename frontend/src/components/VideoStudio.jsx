import { useState } from 'react'
import TemplatePicker from './TemplatePicker'
import RenderStatus from './RenderStatus'

export default function VideoStudio({ questions, onClose }) {
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [templateId, setTemplateId] = useState('Template1')
  const [watermark, setWatermark] = useState('')
  const [timerDuration, setTimerDuration] = useState(5)
  const [includeExplanation, setIncludeExplanation] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [error, setError] = useState(null)
  const [renderMode, setRenderMode] = useState('single') // 'single' | 'batch'

  const question = questions[selectedQuestion]

  const handleRender = async () => {
    setIsSubmitting(true)
    setError(null)
    setJobId(null)

    const q = { ...question }
    if (!includeExplanation) q.explanation = undefined

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          template_id: templateId,
          question_index: selectedQuestion + 1,
          total_questions: questions.length,
          show_timer: true,
          timer_duration: timerDuration,
          reveal_delay: timerDuration + 5,
          watermark: watermark.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Erreur de soumission')
      }

      const data = await res.json()
      setJobId(data.jobId)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setJobId(null)
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark/95 backdrop-blur-sm overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black">🎬 Studio Vidéo</h2>
            <p className="text-white/50 text-sm mt-1">Phase 2 — Génère ta vidéo TikTok MP4</p>
          </div>
          <button onClick={onClose} className="btn-secondary w-10 h-10 flex items-center justify-center text-xl p-0">
            ✕
          </button>
        </div>

        {!jobId ? (
          <div className="space-y-6">
            {/* Question selector */}
            <div className="card">
              <label className="label">📝 Question à mettre en vidéo</label>
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedQuestion(i)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedQuestion === i
                        ? 'border-brand-orange bg-brand-orange/10'
                        : 'border-white/10 bg-white/3 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                        selectedQuestion === i ? 'bg-brand-orange text-white' : 'bg-white/10 text-white/60'
                      }`}>
                        {i + 1}
                      </span>
                      <p className="text-sm text-white/80 line-clamp-2">{q.question}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected question preview */}
            {question && (
              <div className="card border-brand-orange/20">
                <p className="text-xs text-brand-orange font-bold mb-2">APERÇU — Question {selectedQuestion + 1}</p>
                <p className="font-semibold text-sm mb-3">{question.question}</p>
                {question.options && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {question.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded-lg ${
                          opt === question.answer
                            ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                            : 'bg-white/5 border border-white/10 text-white/60'
                        }`}
                      >
                        {['A', 'B', 'C', 'D'][i]}) {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Template picker */}
            <div className="card">
              <TemplatePicker selected={templateId} onChange={setTemplateId} />
            </div>

            {/* Settings */}
            <div className="card space-y-4">
              <p className="font-bold text-sm">⚙️ Réglages</p>

              <div>
                <label className="label">⏱ Durée du timer de réflexion</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={3} max={15} value={timerDuration}
                    onChange={e => setTimerDuration(parseInt(e.target.value))}
                    className="flex-1 accent-brand-orange"
                  />
                  <span className="w-12 text-center font-bold text-brand-orange">{timerDuration}s</span>
                </div>
              </div>

              <div>
                <label className="label">🏷️ Watermark (pseudo TikTok)</label>
                <input
                  type="text"
                  value={watermark}
                  onChange={e => setWatermark(e.target.value.replace(/^@/, ''))}
                  placeholder="ton_pseudo (sans @)"
                  className="input-field"
                  maxLength={30}
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setIncludeExplanation(e => !e)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${includeExplanation ? 'bg-brand-orange' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${includeExplanation ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-white/70">Inclure l'explication 💡</span>
              </label>
            </div>

            {/* Video specs */}
            <div className="flex gap-3 text-xs text-white/40 justify-center flex-wrap">
              {['MP4 1080×1920', '30 fps', 'H.264', '9:16 TikTok', '~18s'].map(s => (
                <span key={s} className="px-2 py-1 bg-white/5 rounded-full">{s}</span>
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleRender}
              disabled={isSubmitting || !question}
              className="btn-primary w-full flex items-center justify-center gap-3 text-base"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Soumission...
                </>
              ) : (
                <>🎬 Générer la vidéo MP4</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <RenderStatus jobId={jobId} onDone={() => {}} />
            <button onClick={handleReset} className="btn-secondary w-full text-sm">
              ← Faire une autre vidéo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
