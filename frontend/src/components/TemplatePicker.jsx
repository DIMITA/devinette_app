const TEMPLATES = [
  {
    id: "Template1",
    name: "Orange Minimal",
    emoji: "🔥",
    desc: "Fond orange vif, texte animé, style épuré — performance maximale",
    colors: ["#FF6B00", "#FF8C38", "#E05500"],
    gradient: "from-orange-500 to-orange-700",
    preview: {
      bg: "linear-gradient(160deg, #FF8C38, #FF6B00, #E05500)",
      textColor: "#fff",
      accent: "#fff",
    },
  },
  {
    id: "Template2",
    name: "Orange + Avatar",
    emoji: "🎭",
    desc: "Fond orange avec personnage animé — style @quiz_culture03",
    colors: ["#FF9B40", "#FF6B00", "#CC4400"],
    gradient: "from-orange-400 to-orange-600",
    preview: {
      bg: "linear-gradient(180deg, #FF9B40, #FF6B00, #CC4400)",
      textColor: "#fff",
      accent: "#FFD700",
    },
  },
  {
    id: "Template3",
    name: "Dark Gold Premium",
    emoji: "👑",
    desc: "Fond sombre avec accents dorés — style premium haut de gamme",
    colors: ["#1A1A2E", "#16213E", "#FFD700"],
    gradient: "from-slate-800 to-slate-900",
    preview: {
      bg: "linear-gradient(180deg, #0D0D1A, #1A1A2E)",
      textColor: "#fff",
      accent: "#FFD700",
    },
  },
]

export default function TemplatePicker({ selected, onChange }) {
  return (
    <div>
      <label className="label">🎨 Template visuel</label>
      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`relative rounded-xl border-2 overflow-hidden transition-all ${
              selected === t.id
                ? "border-brand-orange shadow-lg shadow-brand-orange/30 scale-[1.02]"
                : "border-white/15 hover:border-white/30"
            }`}
          >
            {/* Mini video preview */}
            <div
              style={{ background: t.preview.bg, aspectRatio: "9/16" }}
              className="w-full relative"
            >
              {/* Simulated content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 gap-1">
                <div
                  className="w-full rounded text-center text-white font-black text-xs"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    padding: "4px 6px",
                    fontSize: 10,
                  }}
                >
                  ❓ Question
                </div>
                <div
                  className="w-full rounded text-white text-xs"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    padding: "3px 6px",
                    fontSize: 9,
                  }}
                >
                  A) Option
                </div>
                <div
                  className="w-full rounded text-white text-xs"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    padding: "3px 6px",
                    fontSize: 9,
                  }}
                >
                  B) Option
                </div>
                {t.id === "Template2" && (
                  <div className="text-2xl mt-1">😊</div>
                )}
                {t.id === "Template3" && (
                  <div
                    className="text-xs font-bold mt-1"
                    style={{ color: t.preview.accent }}
                  >
                    ✦ PREMIUM ✦
                  </div>
                )}
              </div>
            </div>

            {/* Label */}
            <div className="p-2 bg-white/5">
              <div className="text-xs font-bold text-white text-center">
                {t.emoji} {t.name}
              </div>
            </div>

            {/* Selected checkmark */}
            {selected === t.id && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-black shadow">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-white/40 mt-2">
        {TEMPLATES.find(t => t.id === selected)?.desc}
      </p>
    </div>
  )
}

export { TEMPLATES }
