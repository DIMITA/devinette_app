import { useState } from 'react'

const LANGUAGES = [
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'ar', label: '🇸🇦 العربية' },
]

const DIFFICULTIES = [
  { value: 'easy', label: '🟢 Facile', desc: 'Accessible à tous' },
  { value: 'medium', label: '🟡 Moyen', desc: 'Quelques réflexions' },
  { value: 'hard', label: '🔴 Difficile', desc: 'Connaissances approfondies' },
  { value: 'expert', label: '💀 Expert', desc: 'Pour les aficionados' },
]

const FORMATS = [
  { value: 'qcm', label: '🎯 QCM', desc: '4 options A/B/C/D' },
  { value: 'open', label: '💬 Ouvert', desc: 'Réponse libre' },
]

const TOPICS = [
  'Culture générale', 'Géographie', 'Histoire', 'Science', 'Cinéma',
  'Musique', 'Sport', 'Animaux', 'Gastronomie', 'Technologie',
  'Littérature', 'Art', 'Politique', 'Nature', 'Autre'
]

const DEFAULT_FORM = {
  topic: '',
  context: '',
  language: 'fr',
  difficulty: 'medium',
  count: 3,
  format: 'qcm',
  include_emojis: true,
  include_explanation: true,
}

export default function GeneratorForm({ onGenerate, isLoading }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [topicSuggestionOpen, setTopicSuggestionOpen] = useState(false)

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.topic.trim()) return
    onGenerate(form)
  }

  return (
    <div className="card animate-fade-in">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-black">
          Génère tes <span className="text-brand-orange">questions TikTok</span> en secondes
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Propulsé par Claude AI — De l'idée au script prêt à filmer
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Topic */}
        <div className="relative">
          <label className="label">
            📌 Sujet de la devinette <span className="text-brand-orange">*</span>
          </label>
          <input
            type="text"
            value={form.topic}
            onChange={e => set('topic', e.target.value)}
            onFocus={() => setTopicSuggestionOpen(true)}
            onBlur={() => setTimeout(() => setTopicSuggestionOpen(false), 150)}
            placeholder="Ex: Capitales du monde, films des années 90..."
            className="input-field"
            required
          />
          {topicSuggestionOpen && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-brand-dark-card border border-white/15 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-2 flex flex-wrap gap-1.5">
                {TOPICS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onMouseDown={() => { set('topic', t); setTopicSuggestionOpen(false) }}
                    className="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-brand-orange/20 hover:text-brand-orange border border-white/10 hover:border-brand-orange/40 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Context (optional) */}
        <div>
          <label className="label">
            💡 Contexte / précisions <span className="text-white/30 font-normal">(optionnel)</span>
          </label>
          <textarea
            value={form.context}
            onChange={e => set('context', e.target.value)}
            placeholder="Ex: Public adulte, style humoristique, questions sur les Jeux Olympiques 2024..."
            className="input-field resize-none h-20 text-sm"
          />
        </div>

        {/* Row: Language + Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">🌍 Langue</label>
            <select value={form.language} onChange={e => set('language', e.target.value)} className="select-field">
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">🎯 Difficulté</label>
            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} className="select-field">
              {DIFFICULTIES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row: Count + Format */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">🔢 Nombre de questions</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={form.count}
                onChange={e => set('count', parseInt(e.target.value))}
                className="flex-1 accent-brand-orange cursor-pointer"
              />
              <span className="w-10 text-center font-bold text-brand-orange text-lg">
                {form.count}
              </span>
            </div>
          </div>
          <div>
            <label className="label">📋 Format</label>
            <div className="flex gap-2">
              {FORMATS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => set('format', f.value)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                    form.format === f.value
                      ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/30'
                      : 'bg-white/5 border-white/15 text-white/60 hover:border-white/30'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => set('include_emojis', !form.include_emojis)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.include_emojis ? 'bg-brand-orange' : 'bg-white/20'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.include_emojis ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-white/70">Inclure des emojis 🎉</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => set('include_explanation', !form.include_explanation)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.include_explanation ? 'bg-brand-orange' : 'bg-white/20'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.include_explanation ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-white/70">Inclure une explication 💡</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !form.topic.trim()}
          className="btn-primary w-full flex items-center justify-center gap-3 text-base"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Génération en cours...
            </>
          ) : (
            <>
              <span>⚡</span>
              Générer {form.count} question{form.count > 1 ? 's' : ''}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
