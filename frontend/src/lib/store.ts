import { create } from 'zustand';
import type { RefineResponse, GenerateResponse, SessionSummary } from './types';

interface AppState {
    // Current session
    currentPrompt: string;
    refinedPrompt: string;
    output: string;
    sessionId: string | null;
    stages: any[];
    model: string;

    // Quota tracking
    quotaRemaining: number | undefined;
    usingUserKey: boolean;

    // Loading states
    isRefining: boolean;
    isGenerating: boolean;

    // Error states
    error: string | null;

    // History
    history: SessionSummary[];

    // Actions
    setCurrentPrompt: (prompt: string) => void;
    setRefinementResult: (result: RefineResponse) => void;
    setGenerationResult: (result: GenerateResponse) => void;
    setRefining: (loading: boolean) => void;
    setGenerating: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setHistory: (history: SessionSummary[]) => void;
    clearSession: () => void;
}

export const useStore = create<AppState>((set) => ({
    // Initial state
    currentPrompt: '',
    refinedPrompt: '',
    output: '',
    sessionId: null,
    stages: [],
    model: '',
    quotaRemaining: undefined,
    usingUserKey: false,
    isRefining: false,
    isGenerating: false,
    error: null,
    history: [],

    // Actions
    setCurrentPrompt: (prompt) => set({ currentPrompt: prompt, error: null }),

    setRefinementResult: (result) => set({
        refinedPrompt: result.refined_prompt,
        sessionId: result.session_id,
        stages: result.stages,
        model: result.model,
        quotaRemaining: result.quota_remaining,
        usingUserKey: result.using_user_key || false,
        isRefining: false,
        error: null,
    }),

    setGenerationResult: (result) => set({
        output: result.output,
        model: result.metadata.model,
        isGenerating: false,
        error: null,
    }),

    setRefining: (loading) => set({ isRefining: loading }),
    setGenerating: (loading) => set({ isGenerating: loading }),
    setError: (error) => set({ error, isRefining: false, isGenerating: false }),
    setHistory: (history) => set({ history }),

    clearSession: () => set({
        currentPrompt: '',
        refinedPrompt: '',
        output: '',
        sessionId: null,
        stages: [],
        model: '',
        error: null,
    }),
}));
