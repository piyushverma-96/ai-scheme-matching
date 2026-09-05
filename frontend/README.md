# ArthSetu AI — Frontend

React + Vite frontend for ArthSetu AI — Smart India Hackathon PS 26092 (Ministry of Social Justice and Empowerment), Team Runtime Rebel.

## Tech Stack

- **React 18 + Vite**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **react-leaflet** + OpenStreetMap (no API key needed)
- **react-i18next** — English & Hindi, extensible to any language by adding a JSON file
- **Axios** for all API calls

---

## Local Development

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env to point at your running backend:
# VITE_API_URL=http://127.0.0.1:8000
```

Make sure the FastAPI backend is also running:

```bash
cd ..
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start the dev server

```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## Production Build

```bash
npm run build
# Output → frontend/dist/
```

---

## Deploying to Vercel

1. Push the `frontend/` directory (or the entire repo) to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Set the **Root Directory** to `frontend`.
4. Add the environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
5. Framework preset: **Vite** (auto-detected).
6. Click **Deploy**.

The included `vercel.json` handles SPA routing (`/guidance/...` etc. all redirect to `index.html`).

---

## Adding a New Language

1. Create `src/locales/XX.json` (copy `en.json` as a template, translate values only — never keys).
2. In `src/i18n.js`, add:
   ```js
   import xx from './locales/xx.json';
   // Inside resources:
   xx: { translation: xx },
   ```
3. Add the new language code to the toggle button in `Header.jsx`.

---

## Project Structure

```
frontend/
├── src/
│   ├── api.js              # All Axios API calls
│   ├── App.jsx             # Root component / step router
│   ├── i18n.js             # i18next setup
│   ├── index.css           # Design system + Tailwind base
│   ├── main.jsx            # Entry point
│   ├── context/
│   │   └── AppContext.jsx  # Global state (step, form data, API results)
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── StepIndicator.jsx
│   │   ├── Tooltip.jsx
│   │   └── ErrorPanel.jsx
│   ├── locales/
│   │   ├── en.json
│   │   └── hi.json
│   └── steps/
│       ├── Step1Details.jsx   # Form + geolocation
│       ├── Step2Scheme.jsx    # Scheme display + reasoning callout
│       ├── Step3EMI.jsx       # Debounced EMI sliders
│       ├── Step4Partners.jsx  # Leaflet map + partner cards
│       └── Step5Guide.jsx     # Document checklist + steps
├── .env.example
├── vercel.json
├── index.html
└── vite.config.js
```
