import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
    RefineRequest,
    RefineResponse,
    GenerateRequest,
    GenerateResponse,
    FeedbackRequest,
    SessionSummary
} from './types';

// Re-export types for convenience
export type {
    RefineRequest,
    RefineResponse,
    RefinementStage,
    GenerateRequest,
    GenerateResponse,
    FeedbackRequest,
    SessionSummary
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

class APIClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    // Server responded with error
                    throw new Error(error.response.data.error || 'An error occurred');
                } else if (error.request) {
                    // Request made but no response
                    throw new Error('No response from server. Please check your connection.');
                } else {
                    // Something else happened
                    throw new Error(error.message || 'An unexpected error occurred');
                }
            }
        );
    }

    async refinePrompt(data: RefineRequest): Promise<RefineResponse> {
        const userApiKey = localStorage.getItem('user_api_key');
        const response = await this.client.post<RefineResponse>('/api/refine', {
            ...data,
            user_api_key: userApiKey || undefined
        });
        return response.data;
    }

    async generateOutput(data: GenerateRequest): Promise<GenerateResponse> {
        const userApiKey = localStorage.getItem('user_api_key');
        const response = await this.client.post<GenerateResponse>('/api/generate', {
            ...data,
            user_api_key: userApiKey || undefined
        });
        return response.data;
    }

    async submitFeedback(data: FeedbackRequest): Promise<{ success: boolean }> {
        const response = await this.client.post<{ success: boolean }>('/api/feedback', data);
        return response.data;
    }

    async getHistory(limit: number = 20): Promise<SessionSummary[]> {
        const response = await this.client.get<{ history: SessionSummary[] }>('/api/history', {
            params: { limit },
        });
        return response.data.history;
    }

    async getSession(sessionId: string): Promise<any> {
        const response = await this.client.get(`/api/session/${sessionId}`);
        return response.data;
    }
}

export const apiClient = new APIClient();
