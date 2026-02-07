import { useState } from 'react';
import { useStore } from '../lib/store';
import { apiClient } from '../lib/api';
import SplitText from './SplitText';
import BoxLoader from './BoxLoader';

const EXAMPLE_PROMPTS = [
    'Explain quantum computing in simple terms',
    'Write a TypeScript function for a glassmorphism effect',
    'Strategy for learning full-stack development',
];

export const PromptInput: React.FC = () => {
    const { currentPrompt, setCurrentPrompt, setRefinementResult, setRefining, setError, isRefining } = useStore();
    const [charCount, setCharCount] = useState(currentPrompt.length);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setCurrentPrompt(value);
        setCharCount(value.length);
    };

    const handleRefine = async () => {
        if (currentPrompt.length < 10) {
            setError('Prompt must be at least 10 characters');
            return;
        }

        setRefining(true);
        setError(null);

        try {
            const result = await apiClient.refinePrompt({ prompt: currentPrompt });
            setRefinementResult(result);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to refine prompt');
        } finally {
            setRefining(false);
        }
    };

    const handleExampleClick = (example: string) => {
        setCurrentPrompt(example);
        setCharCount(example.length);
    };

    return (
        <>
            {/* Full-screen loading overlay */}
            {isRefining && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <BoxLoader />
                    <p className="mt-8 text-purple-300 text-lg font-medium tracking-wider animate-pulse">
                        Forging your prompt...
                    </p>
                </div>
            )}

            <div className="w-full max-w-4xl mx-auto glass p-8 space-y-6 rounded-2xl relative overflow-hidden group">
                {/* Ambient background light in-card */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />

                <div className="space-y-3 relative z-10">
                    <SplitText
                        text="Your Prompt Idea"
                        className="block text-sm font-medium text-gray-400 tracking-wide uppercase"
                        delay={30}
                        duration={1}
                        tag="label"
                        textAlign="left"
                    />

                    <textarea
                        id="prompt-input"
                        value={currentPrompt}
                        onChange={handleInputChange}
                        placeholder="Enter your idea here... What should the AI do?"
                        className="w-full min-h-[160px] max-h-[400px] p-5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-gray-600 resize-y focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner font-light leading-relaxed"
                        maxLength={5000}
                    />

                    <div className="flex justify-between items-center text-xs">
                        <span className={`text-gray-500 ${charCount > 4500 ? 'text-red-400 font-bold' : ''}`}>
                            {charCount.toLocaleString()} / 5,000 characters
                        </span>
                        {charCount > 4500 && (
                            <span className="text-red-400 animate-pulse">Approaching limit</span>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold px-1">Curated Examples</p>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLE_PROMPTS.map((example, index) => (
                            <button
                                key={index}
                                onClick={() => handleExampleClick(example)}
                                className="px-4 py-2 text-xs bg-white/5 border border-white/5 text-gray-400 rounded-full hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleRefine}
                    disabled={currentPrompt.length < 10 || isRefining}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 disabled:opacity-30 disabled:grayscale transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-purple-500/20 flex items-center justify-center group/btn overflow-hidden relative"
                >
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <span className="tracking-widest uppercase text-xs">Forge Perfect Prompt</span>
                </button>
            </div>
        </>
    );
};
