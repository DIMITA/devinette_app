import { useState } from 'react'

export default function ExportButtons({ questions }) {
  const [copiedAll, setCopiedAll] = useState(false)

  const buildTxtContent = () => {
    return questions.map((q, i) => {
      let block = `--- Question ${i + 1} ---\n`
      block += q.question + '\n\n'
      if (q.options) {
        q.options.forEach((opt, j) => {
          block += `  ${['A', 'B', 'C', 'D'][j]}) ${opt}\n`
        })
        block += `\n✅ Réponse : ${q.answer}`
      } else {
        block += `Réponse : ${q.answer}`
      }
      if (q.explanation) block += `\n💡 Explication : ${q.explanation}`
      return block
    }).join('\n\n')
  }

  const downloadTxt = () => {
    const content = buildTxtContent()
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devinettelab-questions-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadJson = () => {
    const content = JSON.stringify({ questions, generated_at: new Date().toISOString() }, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devinettelab-questions-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyAll = () => {
    navigator.clipboard.writeText(buildTxtContent())
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-white/3 border border-white/10 rounded-xl">
      <span className="text-xs text-white/40 font-semibold uppercase tracking-wide self-center mr-1">
        Exporter :
      </span>
      <button
        onClick={downloadJson}
        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
      >
        <span>{ '{}'}</span>
        JSON
      </button>
      <button
        onClick={downloadTxt}
        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
      >
        <span>📄</span>
        TXT
      </button>
      <button
        onClick={copyAll}
        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
      >
        {copiedAll ? '✅ Copié !' : '📋 Tout copier'}
      </button>
    </div>
  )
}
