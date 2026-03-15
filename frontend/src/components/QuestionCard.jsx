import { useState } from 'react'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const OPTION_COLORS = [
  'hover:border-blue-400/60 hover:bg-blue-500/10',
  'hover:border-purple-400/60 hover:bg-purple-500/10',
  'hover:border-green-400/60 hover:bg-green-500/10',
  'hover:border-pink-400/60 hover:bg-pink-500/10',
]
const CORRECT_COLORS = [
  'border-blue-400 bg-blue-500/15 text-blue-300',
  'border-purple-400 bg-purple-500/15 text-purple-300',
  'border-green-400 bg-green-500/15 text-green-300',
  'border-pink-400 bg-pink-500/15 text-pink-300',
]

export default function QuestionCard({ question, index, onCopy }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const correctIndex = question.options
    ? question.options.findIndex(o => o === question.answer || o.startsWith(question.answer))
    : -1

  const handleCopy = () => {
    const text = formatQuestionText(question)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (onCopy) onCopy(text)
  }

  return (
    <div className="card animate-slide-up hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-sm font-black flex items-center justify-center">
            {index + 1}
          </span>
          {question.difficulty && (
            <span className={`badge text-xs ${getDifficultyStyle(question.difficulty)}`}>
              {getDifficultyLabel(question.difficulty)}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          title="Copier cette question"
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0"
        >
          {copied ? '✅ Copié' : '📋 Copier'}
        </button>
      </div>

      {/* Question text */}
      <p className="text-white font-semibold text-base leading-relaxed mb-4">
        {question.question}
      </p>

      {/* Options (QCM) */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-2 mb-4">
          {question.options.map((option, i) => {
            const isCorrect = revealed && (i === correctIndex || option === question.answer)
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCorrect
                    ? CORRECT_COLORS[i % 4] + ' border-opacity-100'
                    : 'border-white/10 bg-white/3 ' + OPTION_COLORS[i % 4]
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                  isCorrect ? 'bg-current/20' : 'bg-white/10'
                }`}>
                  {isCorrect ? '✓' : OPTION_LABELS[i]}
                </span>
                <span className="text-sm">{option}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Open answer */}
      {!question.options && question.answer && (
        <div className={`p-3 rounded-xl border mb-4 transition-all ${
          revealed
            ? 'border-brand-gold/40 bg-brand-gold/10 text-brand-gold'
            : 'border-white/10 bg-white/5 text-white/40'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wide opacity-60 block mb-1">Réponse</span>
          <p className="font-semibold">{revealed ? question.answer : '••••••••'}</p>
        </div>
      )}

      {/* Explanation */}
      {question.explanation && revealed && (
        <div className="p-3 rounded-xl bg-brand-orange/10 border border-brand-orange/20 mb-4 animate-fade-in">
          <p className="text-xs font-bold text-brand-orange mb-1">💡 Explication</p>
          <p className="text-sm text-white/80 leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Reveal button */}
      <button
        onClick={() => setRevealed(r => !r)}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-all ${
          revealed
            ? 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
            : 'border-brand-orange/40 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20'
        }`}
      >
        {revealed ? '🙈 Masquer la réponse' : '👁️ Révéler la réponse'}
      </button>
    </div>
  )
}

function getDifficultyStyle(difficulty) {
  const map = {
    easy: 'bg-green-500/15 text-green-400 border border-green-500/30',
    medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    hard: 'bg-red-500/15 text-red-400 border border-red-500/30',
    expert: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  }
  return map[difficulty] || map.medium
}

function getDifficultyLabel(difficulty) {
  const map = { easy: '🟢 Facile', medium: '🟡 Moyen', hard: '🔴 Difficile', expert: '💀 Expert' }
  return map[difficulty] || difficulty
}

function formatQuestionText(question) {
  let text = question.question + '\n\n'
  if (question.options) {
    question.options.forEach((opt, i) => {
      text += `${['A', 'B', 'C', 'D'][i]}) ${opt}\n`
    })
    text += `\n✅ Bonne réponse : ${question.answer}`
  } else {
    text += `Réponse : ${question.answer}`
  }
  if (question.explanation) {
    text += `\n💡 ${question.explanation}`
  }
  return text
}
