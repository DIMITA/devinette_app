import QuestionCard from './QuestionCard'
import ExportButtons from './ExportButtons'
import SkeletonCard from './SkeletonCard'

export default function QuestionList({ questions, isLoading, onRegenerate }) {
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
        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerate}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            🔄 Regénérer
          </button>
        </div>
      </div>

      {/* Export buttons */}
      <ExportButtons questions={questions} />

      {/* Cards */}
      <div className="mt-5 space-y-4">
        {questions.map((q, i) => (
          <QuestionCard key={i} question={q} index={i} />
        ))}
      </div>

      {/* Regenerate at bottom */}
      <div className="mt-6 text-center">
        <button
          onClick={onRegenerate}
          className="btn-secondary inline-flex items-center gap-2"
        >
          🔄 Regénérer de nouvelles questions
        </button>
      </div>
    </div>
  )
}
