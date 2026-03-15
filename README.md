# 🎯 DevinetteLab

**Plateforme de génération automatique de contenu TikTok quiz — Propulsée par Claude AI**

> Phase 1 — Générateur de scripts IA

---

## Fonctionnalités (Phase 1)

- ⚡ Génération instantanée de quiz par IA (Claude Sonnet)
- 🎯 QCM (4 options A/B/C/D) ou réponse ouverte
- 🌍 Multilingue : FR, EN, ES, AR
- 🎚️ 4 niveaux de difficulté
- 💡 Explications incluses
- 📤 Export JSON et TXT
- 📋 Copie rapide par question
- 📱 Interface mobile-friendly

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| IA | Claude API (Anthropic) |
| Déploiement front | Vercel |
| Déploiement back | Render |

## Lancer en local

### Prérequis
- Node.js 18+
- Python 3.11+
- Une clé API Anthropic ([console.anthropic.com](https://console.anthropic.com))

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp ../.env.example ../.env
# Remplis ANTHROPIC_API_KEY dans .env

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173)

## Structure du projet

```
devinette_app/
├── frontend/              # React + Vite + Tailwind
│   └── src/
│       ├── components/    # Composants UI
│       └── App.jsx
├── backend/               # FastAPI
│   ├── main.py
│   ├── routers/           # Endpoints API
│   ├── services/          # Logique métier (Claude)
│   └── models/            # Schémas Pydantic
├── .env.example
└── README.md
```

## Roadmap

- [x] **Phase 1** — Générateur de scripts IA
- [ ] **Phase 2** — Production vidéo (Remotion + FFMPEG)
- [ ] **Phase 3** — Planning & publication TikTok
- [ ] **Phase 4** — SaaS multi-utilisateurs

## Licence

MIT — Open source, contributions bienvenues 🙌
