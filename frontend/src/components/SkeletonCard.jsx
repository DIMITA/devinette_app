export default function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-white/10" />
        <div className="w-16 h-5 rounded-full bg-white/10" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-3/4" />
      </div>
      <div className="space-y-2 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-11 bg-white/5 rounded-xl border border-white/10" />
        ))}
      </div>
      <div className="h-10 bg-white/5 rounded-xl border border-white/10" />
    </div>
  )
}
