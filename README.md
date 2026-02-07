<p align="center">
  <h1 align="center">⚡Intentra </h1>
  <p align="center">
    <strong>Transform vague ideas into perfect AI prompts — Free forever</strong>
  </p>
  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-demo">Demo</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-api-reference">API</a>
  </p>
</p>

---

A production-ready prompt optimization platform that automatically refines user prompts through multi-stage AI optimization and executes them to generate high-quality outputs. Built on zero-cost infrastructure using Cloudflare Workers and free LLM APIs.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔄 **Automatic Prompt Refinement** | Multi-stage optimization using AI-powered generator loops |
| ⚡ **Instant Output Generation** | Execute refined prompts to get superior results |
| 🎁 **Free Tier** | 5 free requests/day without any signup |
| 🔑 **BYOK Support** | Bring your own Gemini/Groq API key for unlimited access |
| 💾 **Session History** | Access your previous prompts and results |
| 📱 **Responsive Design** | Works seamlessly on desktop, tablet, and mobile |
| ⚡ **Lightning Background** | Stunning animated WebGL background |
| 💰 **Zero-Cost Infrastructure** | Built entirely on free tiers |

## 🎯 How It Works

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌────────────┐
│ User Prompt │ ──▶ │ Prompt Refining │ ──▶ │ Review & Edit│ ──▶ │ AI Output  │
│  (vague)    │     │  (AI-powered)   │     │  (optional)  │     │ (quality)  │
└─────────────┘     └─────────────────┘     └──────────────┘     └────────────┘
```

1. **Enter your prompt** — Type any vague or rough idea
2. **AI refinement** — PromptForge enhances it with context, structure & clarity
3. **Side-by-side comparison** — Review original vs refined prompt
4. **Generate output** — Execute the refined prompt for superior results

## 🛠️ Tech Stack

### Frontend
- **React 19** + TypeScript
- **Vite 7** — Blazing-fast builds
- **Tailwind CSS 4** — Utility-first styling
- **Framer Motion** + **GSAP** — Premium animations
- **Three.js** — WebGL lightning background
- **Zustand** — Lightweight state management
- **React Markdown** — Beautiful output rendering

### Backend
- **Cloudflare Workers** — Serverless edge functions
- **Hono.js** — Ultrafast web framework
- **Cloudflare D1** — SQLite at the edge
- **Cloudflare KV** — Caching and rate limiting
- **Zod** — Schema validation

### LLM APIs
| Provider | Model | Free Tier |
|----------|-------|-----------|
| Google Gemini | `gemini-2.0-flash-exp` | 1,500 req/day |
| Groq | `llama-3.3-70b-versatile` | 14,400 req/day |

> Automatic fallback: If Gemini quota is exhausted, requests seamlessly switch to Groq.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Cloudflare account (free)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/promptforge.git
cd promptforge

# Install all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Get API Keys

| Service | Link | Notes |
|---------|------|-------|
| Gemini API | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Click "Create API Key" |
| Groq API | [console.groq.com](https://console.groq.com) | Free signup, no credit card |

### 3. Configure Backend

```bash
cd backend

# Set API key secrets
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GROQ_API_KEY

# Create D1 database
npx wrangler d1 create promptforge-db
# Copy database_id to wrangler.toml

# Run migrations
npx wrangler d1 execute promptforge-db --file=./schema.sql

# Create KV namespace for caching
npx wrangler kv:namespace create CACHE
# Copy namespace id to wrangler.toml
```

### 4. Configure Frontend

```bash
cd frontend

# Create environment file
echo "VITE_API_URL=http://localhost:8787" > .env
```

### 5. Run Locally

```bash
# From root directory - run both frontend & backend
npm run dev

# Or run separately:
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
```

Open [http://localhost:5173](http://localhost:5173) to see PromptForge in action! 🎉

## 🌐 Deployment

### Backend (Cloudflare Workers)

```bash
cd backend
npm run deploy
```

### Frontend (Cloudflare Pages)

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=promptforge
```

## 📡 API Reference

### Base URL
- **Local:** `http://localhost:8787`
- **Production:** `https://promptforge-backend.your-subdomain.workers.dev`

### Endpoints

#### `POST /api/refine`
Refine a user prompt using AI optimization.

```json
{
  "prompt": "explain quantum computing",
  "user_api_key": "optional-your-api-key"
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "original_prompt": "...",
  "refined_prompt": "...",
  "stages": [...],
  "model": "gemini-2.0-flash",
  "latency_ms": 1234,
  "quota_remaining": 4,
  "using_user_key": false
}
```

#### `POST /api/generate`
Generate output from a refined prompt.

```json
{
  "prompt": "refined prompt here",
  "session_id": "optional-session-id",
  "user_api_key": "optional-your-api-key"
}
```

#### `POST /api/feedback`
Submit user feedback for a session.

```json
{
  "session_id": "uuid",
  "type": "prompt|output",
  "rating": 1,
  "comment": "optional"
}
```

#### `GET /api/history?limit=20`
Get session history for the current user.

#### `GET /api/session/:id`
Get detailed session information.

## 💰 Cost Analysis

**$0/month** for up to 10,000 daily active users

| Service | Free Tier Limit | Usage |
|---------|-----------------|-------|
| Cloudflare Workers | 100,000 req/day | API backend |
| Cloudflare D1 | 5M reads, 100k writes/day | Session storage |
| Cloudflare KV | 100,000 reads, 1,000 writes/day | Caching & rate limiting |
| Gemini API | 1,500 req/day | Primary LLM |
| Groq API | 14,400 req/day | Fallback LLM |

## 📁 Project Structure

```
promptforge/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Hono API routes
│   │   ├── llm.ts            # LLM orchestrator (Gemini/Groq)
│   │   ├── types.ts          # TypeScript types
│   │   └── utils.ts          # Helper functions
│   ├── schema.sql            # D1 database schema
│   └── wrangler.toml         # Cloudflare config
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PromptInput.tsx      # Input form
│   │   │   ├── RefinementResults.tsx # Side-by-side comparison
│   │   │   ├── OutputDisplay.tsx     # Generated output
│   │   │   ├── Settings.tsx          # API key configuration
│   │   │   ├── Lightning.tsx         # WebGL background
│   │   │   └── ...                   # Animation components
│   │   ├── lib/
│   │   │   └── store.ts      # Zustand state management
│   │   ├── App.tsx           # Main application
│   │   └── index.css         # Global styles
│   └── vite.config.ts
├── tests/                     # Load testing
└── package.json              # Monorepo scripts
```

## 🎯 Roadmap

- [x] Core prompt refinement
- [x] Output generation
- [x] Feedback mechanism
- [x] Session history
- [x] BYOK (Bring Your Own Key)
- [x] Daily quota system
- [x] Animated landing page
- [ ] User authentication
- [ ] Prompt templates library
- [ ] Team collaboration
- [ ] API access for developers
- [ ] Chrome extension

## 🧪 Testing

### Load Testing with k6

```bash
cd tests
k6 run load-test.js
```

### Backend Unit Tests

```bash
cd backend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google** — Gemini API with generous free tier
- **Groq** — Lightning-fast inference
- **Cloudflare** — Amazing edge platform with free tier
- **Vercel** — Inspiration for the sleek UI design

---

<p align="center">
  Built with ❤️ using Cloudflare Workers
  <br/>
  <strong>⭐ Star this repo if you find it useful!</strong>
</p>
