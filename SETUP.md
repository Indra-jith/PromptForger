# PromptForge Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Get API Keys

#### Gemini API Key
1. Visit https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key

#### Groq API Key
1. Visit https://console.groq.com
2. Sign up (free, no credit card)
3. Go to API Keys section
4. Create new key
5. Copy the key

### Step 3: Configure Backend

```bash
cd backend

# Set secrets (you'll be prompted to paste each key)
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GROQ_API_KEY
```

### Step 4: Create Database

```bash
# Create D1 database
npx wrangler d1 create promptforge-db

# Copy the database_id from output
# Update wrangler.toml with the database_id

# Run migrations
npx wrangler d1 execute promptforge-db --file=./schema.sql
```

### Step 5: Create KV Namespace

```bash
# Create KV namespace for caching
npx wrangler kv:namespace create CACHE

# Copy the id from output
# Update wrangler.toml with the KV namespace id
```

### Step 6: Run Locally

```bash
# From root directory
npm run dev

# Or run separately:
# Terminal 1: npm run dev:backend
# Terminal 2: npm run dev:frontend
```

### Step 7: Open Browser

- Frontend: http://localhost:5173
- Backend: http://localhost:8787

## Testing

1. Enter a prompt: "explain quantum computing"
2. Click "Refine Prompt"
3. Wait 2-3 seconds
4. Review the refined prompt
5. Click "Generate Answer"
6. See the output!

## Troubleshooting

### Backend won't start
- Check that you've set GEMINI_API_KEY and GROQ_API_KEY
- Verify wrangler.toml has correct database_id and KV namespace id

### Frontend can't connect to backend
- Ensure backend is running on port 8787
- Check VITE_API_URL in frontend/.env

### API errors
- Verify API keys are valid
- Check rate limits (Gemini: 1,500/day, Groq: 14,400/day)

## Deployment

### Backend
```bash
cd backend
npm run deploy
```

### Frontend
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=promptforge
```

## Next Steps

- [ ] Add custom domain
- [ ] Enable analytics
- [ ] Set up monitoring
- [ ] Configure CORS for production domain
