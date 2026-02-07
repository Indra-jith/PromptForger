// Type definitions for API requests and responses

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
    session_id?: string;
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

export interface SessionSummary {
    id: string;
    original_prompt: string;
    created_at: string;
}
