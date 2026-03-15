export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 mt-12">
      <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/30">
        <div className="flex items-center gap-2">
          <span className="font-black text-white/50">DevinetteLab</span>
          <span>—</span>
          <span>Phase 1 • Générateur de scripts</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Propulsé par Claude AI</span>
          <span>•</span>
          <span>Open source MIT</span>
        </div>
      </div>
    </footer>
  )
}
