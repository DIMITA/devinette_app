import QuestionCard from './QuestionCard'
import ExportButtons from './ExportButtons'
import SkeletonCard from './SkeletonCard'

export default function QuestionList({ questions, isLoading, onRegenerate, onCreateVideo }) {
  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-5 rounded-full bg-brand-orange animate-pulse" />
          <p className="text-white/60 text-sm animate-pulse">L'IA génère vos questions...</p>
        </div>
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!questions.length) return null

  return (
    <div className="mt-8 animate-fade-in">
      {/* Results header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-black">
            {questions.length} question{questions.length > 1 ? 's' : ''} générée{questions.length > 1 ? 's' : ''}
          </h3>
          <p className="text-white/40 text-sm mt-0.5">Cliquez sur "Révéler" pour voir les réponses</p>
        </div>
        <button onClick={onRegenerate} className="btn-secondary text-sm flex items-center gap-2">
          🔄 Regénérer
        </button>
      </div>

      {/* Phase 2 CTA — Create video */}
      <div className="p-4 bg-gradient-to-r from-blue-600/20 to-brand-orange/20 border border-white/15 rounded-2xl flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="font-bold text-sm">🎬 Prêt à tourner ?</p>
          <p className="text-xs text-white/50 mt-0.5">Transforme ces questions en vidéo TikTok MP4 en 2 min</p>
        </div>
        <button
          onClick={onCreateVideo}
          className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap flex items-center gap-2"
        >
          🎬 Créer la vidéo
        </button>
      </div>

      {/* Export buttons */}
      <ExportButtons questions={questions} />

      {/* Cards */}
      <div className="mt-5 space-y-4">
        {questions.map((q, i) => (
          <QuestionCard key={i} question={q} index={i} />
        ))}
      </div>

      {/* Bottom actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onRegenerate} className="btn-secondary inline-flex items-center gap-2 justify-center">
          🔄 Regénérer de nouvelles questions
        </button>
        <button onClick={onCreateVideo} className="btn-primary inline-flex items-center gap-2 justify-center">
          🎬 Ouvrir le Studio Vidéo
        </button>
      </div>
    </div>
  )
}
