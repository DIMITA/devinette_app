import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { authFetch } from './TikTokConnect'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const locales = { fr }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })
const DnDCalendar = withDragAndDrop(Calendar)

const STATUS_CONFIG = {
  scheduled:  { color: '#3b82f6', label: 'Planifié',   icon: '📅' },
  publishing: { color: '#f59e0b', label: 'Publication', icon: '📤' },
  published:  { color: '#22c55e', label: 'Publié',      icon: '✅' },
  failed:     { color: '#ef4444', label: 'Échoué',      icon: '❌' },
  cancelled:  { color: '#6b7280', label: 'Annulé',      icon: '🚫' },
}

function EventComponent({ event }) {
  const cfg = STATUS_CONFIG[event.resource?.status] || STATUS_CONFIG.scheduled
  return (
    <div className="flex items-center gap-1 text-xs font-bold overflow-hidden" style={{ color: '#fff' }}>
      <span>{cfg.icon}</span>
      <span className="truncate">{event.title}</span>
    </div>
  )
}

function PostDetailModal({ post, onClose, onCancel, onPublishNow }) {
  const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.scheduled
  const isActive = post.status === 'scheduled'

  return (
    <div
      className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-brand-dark border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black">Détail du post</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: cfg.color + '30', color: cfg.color }}
            >
              {cfg.icon} {cfg.label}
            </span>
          </div>

          {post.title && <p className="text-sm font-bold">{post.title}</p>}

          <div className="text-xs text-white/50 space-y-1">
            <p>🎬 Template : <span className="text-white">{post.template_id}</span></p>
            <p>❓ Questions : <span className="text-white">{post.questions?.length}</span></p>
            <p>📅 Planifié le : <span className="text-white">{new Date(post.scheduled_at).toLocaleString('fr-FR')}</span></p>
            {post.published_at && (
              <p>✅ Publié le : <span className="text-white">{new Date(post.published_at).toLocaleString('fr-FR')}</span></p>
            )}
            {post.error_message && (
              <p className="text-red-400">⚠️ Erreur : {post.error_message}</p>
            )}
          </div>
        </div>

        {isActive && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { onPublishNow(post.id); onClose() }}
              className="btn-primary flex-1 text-sm py-2"
            >
              📤 Publier maintenant
            </button>
            <button
              onClick={() => { onCancel(post.id); onClose() }}
              className="btn-secondary flex-1 text-sm py-2 text-red-400 border-red-500/30"
            >
              🗑 Annuler
            </button>
          </div>
        )}
        {!isActive && (
          <button onClick={onClose} className="btn-secondary w-full text-sm">Fermer</button>
        )}
      </div>
    </div>
  )
}

export default function CalendarView({ tiktokUser }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [view, setView] = useState('month')
  const [date, setDate] = useState(new Date())

  const fetchPosts = useCallback(async () => {
    try {
      const r = await authFetch('/api/schedule')
      if (!r.ok) return
      const data = await r.json()
      setPosts(data)
    } catch (e) {
      console.error('Failed to fetch schedule', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const events = posts.map(p => ({
    id: p.id,
    title: p.title || `Quiz (${p.questions?.length || '?'} Q)`,
    start: new Date(p.scheduled_at),
    end: new Date(new Date(p.scheduled_at).getTime() + 60 * 1000),
    resource: p,
  }))

  const handleEventDrop = async ({ event, start }) => {
    if (event.resource?.status !== 'scheduled') return
    if (new Date(start) <= new Date()) return

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === event.id ? { ...p, scheduled_at: start.toISOString() } : p
    ))

    try {
      const r = await authFetch(`/api/schedule/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify({ scheduled_at: start.toISOString() }),
      })
      if (!r.ok) fetchPosts()  // Revert on error
    } catch {
      fetchPosts()
    }
  }

  const handleCancel = async (postId) => {
    try {
      await authFetch(`/api/schedule/${postId}`, { method: 'DELETE' })
      fetchPosts()
    } catch (e) {
      console.error(e)
    }
  }

  const handlePublishNow = async (postId) => {
    try {
      await authFetch(`/api/schedule/${postId}/publish-now`, { method: 'POST' })
      fetchPosts()
    } catch (e) {
      console.error(e)
    }
  }

  const eventStyleGetter = (event) => {
    const cfg = STATUS_CONFIG[event.resource?.status] || STATUS_CONFIG.scheduled
    return {
      style: {
        backgroundColor: cfg.color,
        border: 'none',
        borderRadius: '6px',
        opacity: event.resource?.status === 'cancelled' ? 0.4 : 1,
        cursor: event.resource?.status === 'scheduled' ? 'grab' : 'default',
      },
    }
  }

  if (!tiktokUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4">📅</span>
        <h3 className="text-xl font-black mb-2">Calendrier de publication</h3>
        <p className="text-white/40 text-sm max-w-xs">
          Connectez votre compte TikTok pour planifier et gérer vos publications.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-end">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-white/60">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div
        style={{ height: 620 }}
        className="rbc-calendar-wrapper rounded-2xl overflow-hidden border border-white/10"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center text-white/40">
            Chargement du calendrier...
          </div>
        ) : (
          <DnDCalendar
            localizer={localizer}
            events={events}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            onEventDrop={handleEventDrop}
            onSelectEvent={e => setSelectedPost(e.resource)}
            eventPropGetter={eventStyleGetter}
            components={{ event: EventComponent }}
            culture="fr"
            messages={{
              today: "Aujourd'hui",
              previous: '‹',
              next: '›',
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
              noEventsInRange: 'Aucune publication planifiée',
            }}
            style={{ height: '100%', background: 'transparent' }}
            draggableAccessor={e => e.resource?.status === 'scheduled'}
          />
        )}
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onCancel={handleCancel}
          onPublishNow={handlePublishNow}
        />
      )}
    </div>
  )
}
