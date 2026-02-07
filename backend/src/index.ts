import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Env, RefineResponse, GenerateResponse, HistoryResponse } from './types';
import { refinePrompt, generateOutput } from './llm';
import { hashString, sanitizeInput, getUserId, calculateLatency } from './utils';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors({
	origin: (origin) => {
		// Allow all localhost origins in development
		if (!origin || origin.startsWith('http://localhost:') || origin === 'https://promptforge.pages.dev') {
			return origin || '*';
		}
		return 'https://promptforge.pages.dev';
	},
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
}));

app.use('*', logger());

// Rate limiting middleware
app.use('/api/*', async (c, next) => {
	// Skip rate limiting if CACHE binding is not available (local dev)
	if (!c.env.CACHE) {
		await next();
		return;
	}

	const ip = c.req.header('cf-connecting-ip') || 'unknown';
	const key = `ratelimit:${ip}`;

	const count = await c.env.CACHE.get(key);
	if (count && parseInt(count) > 100) { // 100 requests per hour
		return c.json({ error: 'Rate limit exceeded. Try again in 1 hour.' }, 429);
	}

	const newCount = count ? parseInt(count) + 1 : 1;
	await c.env.CACHE.put(key, newCount.toString(), { expirationTtl: 3600 });

	await next();
});

// Health check
app.get('/', (c) => c.json({
	message: 'PromptForge API',
	version: '1.0.0',
	endpoints: ['/api/refine', '/api/generate', '/api/feedback', '/api/history', '/api/session/:id'],
	status: 'running'
}));

app.get('/health', (c) => c.json({
	status: 'ok',
	timestamp: Date.now(),
	environment: c.env.ENVIRONMENT
}));

// Refine prompt endpoint
const refineSchema = z.object({
	prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000, 'Prompt too long'),
	user_api_key: z.string().optional(), // Optional user-provided API key
});

app.post('/api/refine', zValidator('json', refineSchema), async (c) => {
	const startTime = Date.now();
	const { prompt, user_api_key } = c.req.valid('json');
	const sanitized = sanitizeInput(prompt);
	const userId = getUserId(c.req.raw);

	try {
		// Check daily quota only if NOT using user's own API key AND CACHE is available
		if (!user_api_key && c.env.CACHE) {
			const today = new Date().toISOString().split('T')[0];
			const quotaKey = `daily_quota:${userId}:${today}`;
			const usageCount = await c.env.CACHE.get(quotaKey);
			const currentUsage = usageCount ? parseInt(usageCount) : 0;

			if (currentUsage >= 5) {
				return c.json({
					error: 'Daily limit reached (5 free requests/day). Please provide your own API key in Settings for unlimited access.',
					quota_exceeded: true,
					reset_time: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
				}, 429);
			}

			// Increment usage
			await c.env.CACHE.put(quotaKey, (currentUsage + 1).toString(), { expirationTtl: 86400 });
		}

		// Check cache first (only for non-user-key requests to avoid key leakage)
		const cacheKey = `prompt:${await hashString(sanitized)}`;
		if (!user_api_key && c.env.CACHE) {
			const cached = await c.env.CACHE.get(cacheKey, { type: 'json' });
			if (cached) {
				return c.json({ ...cached, cached: true });
			}
		}

		// Refine prompt using LLM (with or without user key)
		const result = await refinePrompt(sanitized, c.env, user_api_key);
		const latency = calculateLatency(startTime);

		// Generate session ID
		const sessionId = crypto.randomUUID();

		// Store in D1 (if available)
		if (c.env.DB) {
			await c.env.DB.prepare(
				'INSERT INTO sessions (id, user_id, original_prompt, refined_prompt, stages, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
			).bind(
				sessionId,
				userId,
				sanitized,
				result.refined_prompt,
				JSON.stringify(result.stages),
				result.model,
				latency,
				new Date().toISOString()
			).run();
		}

		// Get remaining quota
		let remaining = 999; // Default for user API key or no CACHE
		if (!user_api_key && c.env.CACHE) {
			const today = new Date().toISOString().split('T')[0];
			const quotaKey = `daily_quota:${userId}:${today}`;
			const usageCount = await c.env.CACHE.get(quotaKey);
			remaining = 5 - parseInt(usageCount || '0');
		}

		const response: RefineResponse = {
			session_id: sessionId,
			original_prompt: sanitized,
			refined_prompt: result.refined_prompt,
			stages: result.stages,
			model: result.model,
			latency_ms: latency,
			cached: false,
			quota_remaining: remaining,
			using_user_key: result.using_user_key
		};

		// Cache result for 1 hour (only if not using user key and CACHE is available)
		if (!user_api_key && c.env.CACHE) {
			await c.env.CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 3600 });
		}

		return c.json(response);
	} catch (error) {
		console.error('Refinement error:', error);
		return c.json({
			error: error instanceof Error ? error.message : 'Failed to refine prompt. Please try again.',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});

// Generate output endpoint
const generateSchema = z.object({
	prompt: z.string().min(1),
	session_id: z.string().optional(),
	user_api_key: z.string().optional(), // Optional user-provided API key
});

app.post('/api/generate', zValidator('json', generateSchema), async (c) => {
	const startTime = Date.now();
	const { prompt, session_id, user_api_key } = c.req.valid('json');

	try {
		const result = await generateOutput(prompt, c.env, user_api_key);
		const latency = calculateLatency(startTime);

		// Update session if session_id provided and DB is available
		if (session_id && c.env.DB) {
			await c.env.DB.prepare(
				'UPDATE sessions SET output_text = ? WHERE id = ?'
			).bind(result.output, session_id).run();
		}

		const response: GenerateResponse = {
			output: result.output,
			metadata: {
				model: result.model,
				tokens: result.tokens,
				latency_ms: latency
			},
			using_user_key: result.using_user_key
		};

		return c.json(response);
	} catch (error) {
		console.error('Generation error:', error);
		return c.json({
			error: error instanceof Error ? error.message : 'Failed to generate output. Please try again.',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});

// Feedback endpoint
const feedbackSchema = z.object({
	session_id: z.string(),
	type: z.enum(['prompt', 'output']),
	rating: z.number().min(-1).max(1),
	comment: z.string().optional(),
});

app.post('/api/feedback', zValidator('json', feedbackSchema), async (c) => {
	const data = c.req.valid('json');

	try {
		const field = data.type === 'prompt' ? 'feedback_prompt' : 'feedback_output';

		await c.env.DB.prepare(
			`UPDATE sessions SET ${field} = ?, feedback_comment = ? WHERE id = ?`
		).bind(data.rating, data.comment || null, data.session_id).run();

		return c.json({ success: true });
	} catch (error) {
		console.error('Feedback error:', error);
		return c.json({ error: 'Failed to submit feedback' }, 500);
	}
});

// History endpoint
app.get('/api/history', async (c) => {
	const userId = getUserId(c.req.raw);
	const limit = parseInt(c.req.query('limit') || '20');

	try {
		const { results } = await c.env.DB.prepare(
			'SELECT id, original_prompt, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
		).bind(userId, limit).all();

		const response: HistoryResponse = {
			history: results as any[]
		};

		return c.json(response);
	} catch (error) {
		console.error('History error:', error);
		return c.json({ error: 'Failed to fetch history' }, 500);
	}
});

// Session detail endpoint
app.get('/api/session/:id', async (c) => {
	const sessionId = c.req.param('id');

	try {
		const result = await c.env.DB.prepare(
			'SELECT * FROM sessions WHERE id = ?'
		).bind(sessionId).first();

		if (!result) {
			return c.json({ error: 'Session not found' }, 404);
		}

		return c.json(result);
	} catch (error) {
		console.error('Session fetch error:', error);
		return c.json({ error: 'Failed to fetch session' }, 500);
	}
});

export default app;
