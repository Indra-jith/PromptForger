import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '../lib/store';
import { apiClient } from '../lib/api';
import SplitText from './SplitText';

export const OutputDisplay: React.FC = () => {
    const { output, model, sessionId, refinedPrompt, setGenerationResult, setGenerating, setError, isGenerating } = useStore();
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<number | null>(null);

    if (!output) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleRegenerate = async () => {
        setGenerating(true);
        setError(null);

        try {
            const result = await apiClient.generateOutput({
                prompt: refinedPrompt,
                session_id: sessionId || undefined
            });
            setGenerationResult(result);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to regenerate output');
        } finally {
            setGenerating(false);
        }
    };

    const handleFeedback = async (rating: -1 | 1) => {
        if (!sessionId) return;

        setFeedback(rating);
        try {
            await apiClient.submitFeedback({
                session_id: sessionId,
                type: 'output',
                rating,
            });
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass p-8 rounded-2xl space-y-8 relative overflow-hidden group">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <SplitText
                        text="Generated Mastery"
                        className="text-2xl font-bold tracking-tight text-white"
                        delay={40}
                        duration={1.2}
                        tag="h2"
                        textAlign="left"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 ${copied
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {copied ? '✓ Copied' : '📋 Copy Text'}
                        </button>
                        <button
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                            className="px-4 py-2 text-xs font-semibold bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 flex items-center gap-2"
                        >
                            {isGenerating ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : '🔄'}
                            Regenerate
                        </button>
                    </div>
                </div>

                {/* Markdown Output */}
                <div className="relative z-10 p-1 rounded-xl bg-gradient-to-br from-white/5 to-transparent">
                    <div className="prose prose-sm max-w-none prose-invert p-6 bg-black/40 rounded-lg max-h-[600px] overflow-y-auto no-scrollbar border border-white/5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {output}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Footer Metadata & Feedback */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Quality Feedback</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleFeedback(1)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 transition-all ${feedback === 1 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                        }`}
                                >
                                    👍
                                </button>
                                <button
                                    onClick={() => handleFeedback(-1)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 transition-all ${feedback === -1 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                        }`}
                                >
                                    👎
                                </button>
                            </div>
                        </div>
                        <div className="hidden sm:block h-8 w-px bg-white/5" />
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-gray-500 rounded-full">
                            Engine: {model}
                        </span>
                    </div>

                    <button
                        onClick={() => useStore.getState().clearSession()}
                        className="w-full sm:w-auto px-6 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                    >
                        + Create New Project
                    </button>
                </div>
            </div>
        </div>
    );
};
