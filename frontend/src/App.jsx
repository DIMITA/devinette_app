import { useState } from 'react'
import Header from './components/Header'
import GeneratorForm from './components/GeneratorForm'
import QuestionList from './components/QuestionList'
import VideoStudio from './components/VideoStudio'
import CalendarView from './components/CalendarView'
import TikTokConnect from './components/TikTokConnect'
import Footer from './components/Footer'

// Handle /auth/success?token= redirect at the top level
const urlParams = new URLSearchParams(window.location.search)
const tokenFromCallback = urlParams.get('token')
if (tokenFromCallback && window.location.pathname === '/auth/success') {
  localStorage.setItem('devinette_jwt', tokenFromCallback)
  window.history.replaceState({}, '', '/')
}

export default function App() {
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastParams, setLastParams] = useState(null)
  const [showStudio, setShowStudio] = useState(false)
  const [activeTab, setActiveTab] = useState('studio')   // 'studio' | 'calendar'
  const [tiktokUser, setTiktokUser] = useState(null)

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

        {/* Phase pills + TikTok connect */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            <span className="badge bg-brand-orange/20 text-brand-orange border border-brand-orange/30 text-xs">
              ✅ Phase 1 — Générateur de scripts
            </span>
            <span className="badge bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
              ✅ Phase 2 — Production vidéo
            </span>
            <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs">
              ✅ Phase 3 — Planning & TikTok
            </span>
          </div>
          <TikTokConnect onUserChange={setTiktokUser} />
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'studio' ? 'bg-brand-orange text-white shadow' : 'text-white/50 hover:text-white/80'
            }`}
          >
            🎬 Studio
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'calendar' ? 'bg-brand-orange text-white shadow' : 'text-white/50 hover:text-white/80'
            }`}
          >
            📅 Calendrier
          </button>
        </div>

        {/* Studio tab */}
        {activeTab === 'studio' && (
          <>
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
                onCreateVideo={() => setShowStudio(true)}
              />
            )}
          </>
        )}

        {/* Calendar tab */}
        {activeTab === 'calendar' && (
          <CalendarView tiktokUser={tiktokUser} />
        )}
      </main>

      <Footer />

      {/* Video Studio modal */}
      {showStudio && questions.length > 0 && (
        <VideoStudio
          questions={questions}
          tiktokUser={tiktokUser}
          onClose={() => setShowStudio(false)}
        />
      )}
    </div>
  )
}
