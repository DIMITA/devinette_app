import { useState } from 'react'
import TemplatePicker from './TemplatePicker'
import RenderStatus from './RenderStatus'
import VoicePicker from './VoicePicker'
import StylePicker from './StylePicker'

export default function VideoStudio({ questions, tiktokUser, onClose }) {
  const [mode, setMode] = useState(questions.length > 1 ? 'multi' : 'single')
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [templateId, setTemplateId] = useState('Template1')
  const [watermark, setWatermark] = useState('')
  const [timerDuration, setTimerDuration] = useState(5)
  const [includeExplanation, setIncludeExplanation] = useState(true)
  const [voice, setVoice] = useState('fr')
  const [colorScheme, setColorScheme] = useState('orange')
  const [bgPattern, setBgPattern] = useState('rays')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [error, setError] = useState(null)

  const question = questions[selectedQuestion]
  const isMulti = mode === 'multi'
  const totalDurationSec = (isMulti ? questions.length : 1) * 18

  const handleRender = async () => {
    setIsSubmitting(true)
    setError(null)
    setJobId(null)

    const stripExplanation = (q) => ({
      ...q,
      explanation: includeExplanation ? q.explanation : undefined,
    })

    try {
      let res
      if (isMulti) {
        res = await fetch('/api/render/multi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: questions.map(stripExplanation),
            template_id: templateId,
            watermark: watermark.trim() || null,
            voice,
            color_scheme: colorScheme,
            bg_pattern: bgPattern,
          }),
        })
      } else {
        res = await fetch('/api/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: stripExplanation(question),
            template_id: templateId,
            question_index: selectedQuestion + 1,
            total_questions: questions.length,
            show_timer: true,
            timer_duration: timerDuration,
            reveal_delay: timerDuration + 5,
            watermark: watermark.trim() || null,
            lang: voice,
            color_scheme: colorScheme,
            bg_pattern: bgPattern,
          }),
        })
      }

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

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark/95 backdrop-blur-sm overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black">🎬 Studio Vidéo</h2>
            <p className="text-white/50 text-sm mt-1">MP4 1080×1920 · 30fps · H.264</p>
          </div>
          <button onClick={onClose} className="btn-secondary w-10 h-10 flex items-center justify-center text-xl p-0">✕</button>
        </div>

        {!jobId ? (
          <div className="space-y-5">

            {/* Mode toggle */}
            {questions.length > 1 && (
              <div className="card p-2">
                <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setMode('single')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
                      !isMulti ? 'bg-brand-orange text-white shadow' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    1 question
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('multi')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
                      isMulti ? 'bg-brand-orange text-white shadow' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    Toutes les {questions.length} questions
                  </button>
                </div>
                {isMulti && (
                  <p className="text-xs text-white/40 text-center mt-2">
                    Une seule vidéo enchaînant les {questions.length} questions — durée ~{totalDurationSec}s
                  </p>
                )}
              </div>
            )}

            {/* Single question selector */}
            {!isMulti && (
              <div className="card">
                <label className="label">📝 Question à mettre en vidéo</label>
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <button
                      key={i} type="button"
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
                        }`}>{i + 1}</span>
                        <p className="text-sm text-white/80 line-clamp-2">{q.question}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Multi question preview */}
            {isMulti && (
              <div className="card border-brand-orange/20">
                <p className="text-xs text-brand-orange font-bold mb-3">QUESTIONS ({questions.length})</p>
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded bg-brand-orange/20 text-brand-orange text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-xs text-white/70 line-clamp-1">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template */}
            <div className="card">
              <TemplatePicker selected={templateId} onChange={setTemplateId} />
            </div>

            {/* Voice picker */}
            <div className="card">
              <VoicePicker value={voice} onChange={setVoice} />
            </div>

            {/* Style picker */}
            <div className="card">
              <StylePicker
                colorScheme={colorScheme}
                onColorChange={setColorScheme}
                bgPattern={bgPattern}
                onPatternChange={setBgPattern}
              />
            </div>

            {/* Settings */}
            <div className="card space-y-4">
              <p className="font-bold text-sm">⚙️ Réglages</p>

              {!isMulti && (
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
              )}

              <div>
                <label className="label">🏷️ Watermark (pseudo TikTok)</label>
                <input
                  type="text" value={watermark}
                  onChange={e => setWatermark(e.target.value.replace(/^@/, ''))}
                  placeholder="ton_pseudo (sans @)"
                  className="input-field" maxLength={30}
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setIncludeExplanation(e => !e)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${includeExplanation ? 'bg-brand-orange' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${includeExplanation ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-white/70">Inclure l'explication 💡 <span className="text-white/40">(+ voix)</span></span>
              </label>
            </div>

            {/* Specs */}
            <div className="flex gap-2 text-xs text-white/40 justify-center flex-wrap">
              {[
                'MP4 1080×1920',
                '30fps H.264',
                '9:16 TikTok',
                `~${totalDurationSec}s`,
                isMulti ? `${questions.length} questions` : '1 question',
                `🎙️ ${voice.toUpperCase()}`,
                `🎨 ${colorScheme}`,
                `🌀 ${bgPattern}`,
              ].map(s => (
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
              disabled={isSubmitting || (!isMulti && !question)}
              className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Soumission en cours...
                </>
              ) : (
                <>
                  🎬 {isMulti
                    ? `Générer la vidéo (${questions.length} questions)`
                    : 'Générer la vidéo'}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <RenderStatus
            jobId={jobId}
            onDone={() => {}}
            questions={isMulti ? questions : [question]}
            templateId={templateId}
            videoSettings={{ voice, colorScheme, bgPattern }}
            tiktokUser={tiktokUser}
          />
            <button onClick={() => { setJobId(null); setError(null) }} className="btn-secondary w-full text-sm">
              ← Faire une autre vidéo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
