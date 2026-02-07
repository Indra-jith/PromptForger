import { useState, useEffect } from 'react';
import type { FC } from 'react';

export const Settings: FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [keyType, setKeyType] = useState<'gemini' | 'groq'>('gemini');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load saved API key from localStorage
        const savedKey = localStorage.getItem('user_api_key');
        const savedType = localStorage.getItem('api_key_type') as 'gemini' | 'groq';
        if (savedKey) {
            setApiKey(savedKey);
            setKeyType(savedType || 'gemini');
        }
    }, []);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('user_api_key', apiKey.trim());
            localStorage.setItem('api_key_type', keyType);
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 1500);
        }
    };

    const handleClear = () => {
        localStorage.removeItem('user_api_key');
        localStorage.removeItem('api_key_type');
        setApiKey('');
        setSaved(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-purple-500/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <span className="text-xl">⚙️</span>
                        </div>
                        <h2 className="text-xl font-bold text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Free Tier Info */}
                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🎁</span>
                            <p className="font-semibold text-purple-300">Free Tier: 5 requests/day</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Want unlimited access? Add your own API key below (it's free!)
                        </p>
                    </div>

                    {/* API Provider Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">API Provider</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setKeyType('gemini')}
                                className={`p-3 rounded-xl border transition-all ${keyType === 'gemini'
                                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-2xl mb-1">🔮</div>
                                <div className="text-sm font-medium">Gemini</div>
                                <div className="text-xs text-gray-500">Recommended</div>
                            </button>
                            <button
                                onClick={() => setKeyType('groq')}
                                className={`p-3 rounded-xl border transition-all ${keyType === 'groq'
                                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-2xl mb-1">⚡</div>
                                <div className="text-sm font-medium">Groq</div>
                                <div className="text-xs text-gray-500">Llama 3.3</div>
                            </button>
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            {keyType === 'gemini' ? 'Gemini' : 'Groq'} API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Paste your API key here"
                            className="w-full p-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                        />
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>🔒</span> Your key is stored locally and never sent to our servers
                        </p>
                    </div>

                    {/* Get API Key Link */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <span>🔑</span> Get a free API key:
                        </p>
                        {keyType === 'gemini' ? (
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                            >
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                Get Gemini API Key (1,500 req/day free)
                            </a>
                        ) : (
                            <a
                                href="https://console.groq.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                            >
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                Get Groq API Key (14,400 req/day free)
                            </a>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={!apiKey.trim()}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                        >
                            {saved ? '✓ Saved!' : 'Save API Key'}
                        </button>
                        {apiKey && (
                            <button
                                onClick={handleClear}
                                className="px-4 py-3 bg-red-500/10 text-red-400 font-medium rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
