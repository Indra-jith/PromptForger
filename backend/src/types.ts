// Type definitions for Cloudflare Workers environment
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
  GEMINI_API_KEY: string;
  GROQ_API_KEY: string;
  UPSTASH_REDIS_URL: string;
  UPSTASH_REDIS_TOKEN: string;
  ENVIRONMENT: string;
}

// Request/Response types
export interface RefineRequest {
  prompt: string;
}

export interface RefineResponse {
  session_id: string;
  original_prompt: string;
  refined_prompt: string;
  stages: RefinementStage[];
  model: string;
  latency_ms: number;
  cached?: boolean;
  quota_remaining?: number;
  using_user_key?: boolean;
}

export interface RefinementStage {
  stage: 'generator' | 'critic' | 'final_refinement';
  output: string;
  reasoning?: string;
  scores?: {
    clarity: number;
    specificity: number;
    completeness: number;
    actionability: number;
  };
  suggestions?: string[];
  changes?: string[];
}

export interface GenerateRequest {
  prompt: string;
  stream?: boolean;
}

export interface GenerateResponse {
  output: string;
  metadata: {
    model: string;
    tokens: number;
    latency_ms: number;
  };
  using_user_key?: boolean;
}

export interface FeedbackRequest {
  session_id: string;
  type: 'prompt' | 'output';
  rating: -1 | 0 | 1;
  comment?: string;
}

export interface HistoryResponse {
  history: SessionSummary[];
}

export interface SessionSummary {
  id: string;
  original_prompt: string;
  created_at: string;
}

export interface SessionDetail {
  id: string;
  user_id: string;
  original_prompt: string;
  refined_prompt: string;
  output_text: string;
  stages: RefinementStage[];
  model: string;
  latency_ms: number;
  created_at: string;
  feedback_prompt: number;
  feedback_output: number;
  feedback_comment: string;
}
