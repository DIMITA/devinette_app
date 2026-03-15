import { useState } from 'react'
import Header from './components/Header'
import GeneratorForm from './components/GeneratorForm'
import QuestionList from './components/QuestionList'
import Footer from './components/Footer'

export default function App() {
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastParams, setLastParams] = useState(null)

  const handleGenerate = async (params) => {
    setIsLoading(true)
    setError(null)
    setLastParams(params)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Erreur lors de la génération')
      }

      const data = await response.json()
      setQuestions(data.questions)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = () => {
    if (lastParams) handleGenerate(lastParams)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />

        {error && (
          <div className="mt-6 p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 flex items-start gap-3 animate-fade-in">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold">Erreur de génération</p>
              <p className="text-sm mt-1 opacity-80">{error}</p>
            </div>
          </div>
        )}

        {(isLoading || questions.length > 0) && (
          <QuestionList
            questions={questions}
            isLoading={isLoading}
            onRegenerate={handleRegenerate}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
