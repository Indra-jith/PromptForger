import { useState } from 'react';
import { useStore } from '../lib/store';
import { apiClient } from '../lib/api';
import SplitText from './SplitText';

export const RefinementResults: React.FC = () => {
    const { currentPrompt, refinedPrompt, stages, model, sessionId, setGenerationResult, setGenerating, setError, isGenerating } = useStore();
    const [showStages, setShowStages] = useState(false);
    const [feedback, setFeedback] = useState<number | null>(null);

    if (!refinedPrompt) return null;

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);

        try {
            const result = await apiClient.generateOutput({
                prompt: refinedPrompt,
                session_id: sessionId || undefined
            });
            setGenerationResult(result);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to generate output');
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
                type: 'prompt',
                rating,
            });
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="glass p-8 rounded-2xl space-y-8 relative overflow-hidden group">
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

                <div className="flex items-center justify-between relative z-10">
                    <SplitText
                        text="Refinement Results"
                        className="text-2xl font-bold tracking-tight text-white"
                        delay={40}
                        duration={1.2}
                        tag="h2"
                        textAlign="left"
                    />
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-gray-400 rounded-full">
                            Model: {model}
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    {/* Original Prompt */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Initial Context</h3>
                        </div>
                        <div className="p-5 bg-white/5 border border-white/5 rounded-xl text-sm text-gray-400 leading-relaxed italic line-clamp-6 hover:line-clamp-none transition-all">
                            "{currentPrompt}"
                        </div>
                    </div>

                    {/* Refined Prompt */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Forged Prompt</h3>
                        </div>
                        <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-white leading-relaxed shadow-lg shadow-purple-500/5">
                            {refinedPrompt}
                        </div>
                    </div>
                </div>

                {/* Expandable Stages */}
                {stages.length > 0 && (
                    <div className="border-t border-white/5 pt-6 relative z-10">
                        <button
                            onClick={() => setShowStages(!showStages)}
                            className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group/stages"
                        >
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full bg-white/5 group-hover/stages:bg-white/10 transition-all ${showStages ? 'rotate-90' : ''}`}>
                                ➔
                            </span>
                            <span className="font-medium">View the Forging Process</span>
                        </button>

                        {showStages && (
                            <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                {stages.map((stage, index) => (
                                    <div key={index} className="p-5 bg-white/5 border border-white/5 rounded-xl flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="font-semibold text-sm text-gray-200 capitalize tracking-tight">{stage.stage}</div>
                                            {stage.reasoning && (
                                                <div className="text-sm text-gray-500 leading-relaxed">{stage.reasoning}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Helpful?</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleFeedback(1)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full border border-white/10 transition-all ${feedback === 1 ? 'bg-green-500/20 border-green-500/50 text-green-400 scale-110' : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                    }`}
                            >
                                👍
                            </button>
                            <button
                                onClick={() => handleFeedback(-1)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full border border-white/10 transition-all ${feedback === -1 ? 'bg-red-500/20 border-red-500/50 text-red-400 scale-110' : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                    }`}
                            >
                                👎
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full sm:w-auto min-w-[240px] py-4 px-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 disabled:grayscale transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-emerald-500/20 flex items-center justify-center group/gen relative overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/gen:translate-x-full transition-transform duration-700" />

                        {isGenerating ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="tracking-widest uppercase text-xs">Summoning Output...</span>
                            </div>
                        ) : (
                            <span className="tracking-widest uppercase text-xs font-bold">Summon Final Output</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
