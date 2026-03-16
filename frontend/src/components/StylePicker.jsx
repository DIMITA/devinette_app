const COLOR_SCHEMES = [
  { id: 'orange',  label: 'Orange Feu',    emoji: '🔥', accent: '#FF6B00', bg: '#FF8C38' },
  { id: 'blue',    label: 'Bleu Cosmos',   emoji: '💙', accent: '#00CFFF', bg: '#1a3a6b' },
  { id: 'purple',  label: 'Violet Nuit',   emoji: '💜', accent: '#FF69B4', bg: '#4a0080' },
  { id: 'green',   label: 'Vert Matrix',   emoji: '💚', accent: '#00FF7F', bg: '#0d3320' },
  { id: 'red',     label: 'Rouge Passion', emoji: '❤️', accent: '#FF6B00', bg: '#7a0000' },
  { id: 'teal',    label: 'Turquoise',     emoji: '🌊', accent: '#00FFFF', bg: '#006666' },
  { id: 'gold',    label: 'Doré Premium',  emoji: '⭐', accent: '#FFD700', bg: '#1A1A2E' },
  { id: 'dark',    label: 'Noir Minimal',  emoji: '🌑', accent: '#FFFFFF', bg: '#111111' },
];

const BG_PATTERNS = [
  { id: 'rays',      label: 'Rayons',     emoji: '☀️' },
  { id: 'particles', label: 'Particules', emoji: '✨' },
  { id: 'dots',      label: 'Points',     emoji: '⚫' },
  { id: 'none',      label: 'Aucun',      emoji: '⬜' },
];

export default function StylePicker({ colorScheme, onColorChange, bgPattern, onPatternChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Color schemes */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🎨 Couleur
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {COLOR_SCHEMES.map(s => {
            const selected = colorScheme === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onColorChange(s.id)}
                title={s.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '10px',
                  outline: selected ? `2px solid white` : '2px solid transparent',
                  outlineOffset: '2px',
                  transition: 'outline 0.15s',
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${s.bg}, ${s.accent})`,
                  border: selected ? '2px solid white' : '2px solid rgba(255,255,255,0.15)',
                  boxShadow: selected ? `0 0 12px ${s.accent}88` : 'none',
                  transition: 'border 0.15s, box-shadow 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {selected ? '✓' : s.emoji}
                </div>
                <span style={{ fontSize: '10px', color: selected ? 'white' : '#9ca3af', fontWeight: selected ? 700 : 400, maxWidth: '48px', textAlign: 'center', lineHeight: 1.2 }}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background patterns */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🌀 Motif
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {BG_PATTERNS.map(p => {
            const selected = bgPattern === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPatternChange(p.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  background: selected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: selected ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  transition: 'background 0.15s, border 0.15s',
                  minWidth: '72px',
                }}
              >
                <span style={{ fontSize: '22px' }}>{p.emoji}</span>
                <span style={{ fontSize: '11px', color: selected ? 'white' : '#9ca3af', fontWeight: selected ? 700 : 400 }}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
