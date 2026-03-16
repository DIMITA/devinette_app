export interface ColorScheme {
  id: string;
  label: string;
  emoji: string;
  bg: string;        // CSS gradient for background
  accent: string;    // highlight / correct-answer color
  optionBg: string;  // option item background
  labelBg: string;   // option label circle background
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'orange',
    label: 'Orange Feu', emoji: '🔥',
    bg: 'linear-gradient(160deg, #FF8C38 0%, #FF6B00 50%, #E05500 100%)',
    accent: '#FFD700', optionBg: 'rgba(0,0,0,0.20)', labelBg: 'rgba(255,255,255,0.25)',
  },
  {
    id: 'blue',
    label: 'Bleu Cosmos', emoji: '💙',
    bg: 'linear-gradient(160deg, #1a3a6b 0%, #0D1F4E 50%, #0a1530 100%)',
    accent: '#00CFFF', optionBg: 'rgba(0,30,80,0.4)', labelBg: 'rgba(0,150,255,0.25)',
  },
  {
    id: 'purple',
    label: 'Violet Nuit', emoji: '💜',
    bg: 'linear-gradient(160deg, #4a0080 0%, #2D0054 50%, #1a0030 100%)',
    accent: '#FF69B4', optionBg: 'rgba(40,0,80,0.4)', labelBg: 'rgba(150,0,255,0.25)',
  },
  {
    id: 'green',
    label: 'Vert Matrix', emoji: '💚',
    bg: 'linear-gradient(160deg, #0d3320 0%, #071a10 50%, #030e09 100%)',
    accent: '#00FF7F', optionBg: 'rgba(0,40,20,0.4)', labelBg: 'rgba(0,150,70,0.25)',
  },
  {
    id: 'red',
    label: 'Rouge Passion', emoji: '❤️',
    bg: 'linear-gradient(160deg, #7a0000 0%, #4a0000 50%, #2a0000 100%)',
    accent: '#FF6B00', optionBg: 'rgba(60,0,0,0.4)', labelBg: 'rgba(180,0,0,0.25)',
  },
  {
    id: 'teal',
    label: 'Turquoise', emoji: '🌊',
    bg: 'linear-gradient(160deg, #006666 0%, #004444 50%, #002222 100%)',
    accent: '#00FFFF', optionBg: 'rgba(0,40,40,0.4)', labelBg: 'rgba(0,140,140,0.25)',
  },
  {
    id: 'gold',
    label: 'Doré Premium', emoji: '⭐',
    bg: 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 50%, #0D0D1A 100%)',
    accent: '#FFD700', optionBg: 'rgba(255,215,0,0.05)', labelBg: 'rgba(255,215,0,0.15)',
  },
  {
    id: 'dark',
    label: 'Noir Minimal', emoji: '🌑',
    bg: 'linear-gradient(160deg, #1a1a1a 0%, #111111 50%, #0a0a0a 100%)',
    accent: '#FFFFFF', optionBg: 'rgba(255,255,255,0.05)', labelBg: 'rgba(255,255,255,0.15)',
  },
];

export function getColorScheme(id?: string): ColorScheme {
  return COLOR_SCHEMES.find(s => s.id === id) ?? COLOR_SCHEMES[0];
}

export const BG_PATTERNS = [
  { id: 'rays',      label: 'Rayons',     emoji: '☀️' },
  { id: 'particles', label: 'Particules', emoji: '✨' },
  { id: 'dots',      label: 'Points',     emoji: '⚫' },
  { id: 'none',      label: 'Aucun',      emoji: '⬜' },
];
