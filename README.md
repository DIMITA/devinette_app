# 🎯 DevinetteLab

**Plateforme de génération automatique de contenu TikTok quiz — Propulsée par Claude AI**

> Phase 1 + Phase 2 — Générateur de scripts & Studio Vidéo

---

## Fonctionnalités

### Phase 1 — Générateur de scripts ✅
- ⚡ Génération instantanée de quiz par IA (Claude Sonnet)
- 🎯 QCM (4 options A/B/C/D) ou réponse ouverte
- 🌍 Multilingue : FR, EN, ES, AR
- 🎚️ 4 niveaux de difficulté
- 💡 Explications incluses
- 📤 Export JSON et TXT
- 📱 Interface mobile-friendly

### Phase 2 — Studio Vidéo ✅
- 🎬 Rendu automatique MP4 1080×1920 (TikTok 9:16)
- 🎨 3 templates animés :
  - **Template 1** — Orange minimal, texte animé
  - **Template 2** — Orange + avatar animé (style @quiz_culture03)
  - **Template 3** — Dark gold premium
- ⏱ Timer de réflexion animé
- ✅ Révélation de la bonne réponse
- 💡 Explication animée
- 🏷️ Watermark personnalisable
- 📥 Queue de rendu asynchrone

### À venir
- **Phase 3** — Planning & publication TikTok automatique
- **Phase 4** — SaaS multi-utilisateurs, analytics

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| Renderer vidéo | Node.js + Remotion + TypeScript |
| IA | Claude API (Anthropic) |
| Déploiement front | Vercel |
| Déploiement back | Render |

---

## Lancer en local

### Prérequis
- Node.js 18+
- Python 3.11+
- Une clé API Anthropic ([console.anthropic.com](https://console.anthropic.com))

### 1. Configuration

```bash
cp .env.example .env
# Remplis ANTHROPIC_API_KEY dans .env
```

### 2. Backend (Python FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Renderer vidéo (Node.js + Remotion)

```bash
cd renderer
npm install
npm run dev   # démarre sur http://localhost:3001
```

> **Note** : Le renderer nécessite Chromium pour Remotion.
> Sur Linux : `npx puppeteer browsers install chrome`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev   # démarre sur http://localhost:5173
```

---

## Remotion Studio (aperçu des templates)

```bash
cd renderer
npm run studio
# → Ouvre http://localhost:3000 avec les 3 templates
```

---

## Structure du projet

```
devinette_app/
├── frontend/              # React + Vite + Tailwind
│   └── src/
│       ├── components/    # Header, GeneratorForm, QuestionCard,
│       │                  # VideoStudio, TemplatePicker, RenderStatus…
│       └── App.jsx
│
├── backend/               # FastAPI
│   ├── main.py
│   ├── routers/           # generate.py, render.py
│   ├── services/          # claude_service.py, render_service.py
│   └── models/            # schemas.py, render_schemas.py
│
├── renderer/              # Node.js + Remotion
│   └── src/
│       ├── Root.tsx        # Compositions Remotion
│       ├── server.ts       # Express render API
│       ├── render.ts       # Logique de rendu
│       └── compositions/
│           ├── Template1.tsx   # Orange minimal
│           ├── Template2.tsx   # Orange + avatar
│           ├── Template3.tsx   # Dark gold
│           └── components/    # QuestionText, OptionItem, TimerBar…
│
├── .env.example
├── render.yaml            # Config Render.com
└── vercel.json            # Config Vercel
```

---

## Licence

MIT — Open source, contributions bienvenues 🙌
