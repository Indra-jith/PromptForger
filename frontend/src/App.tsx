import { useState, memo } from 'react';
import { useStore } from './lib/store';
import { PromptInput } from './components/PromptInput';
import { RefinementResults } from './components/RefinementResults';
import { OutputDisplay } from './components/OutputDisplay';
import { Settings } from './components/Settings';
import Lightning from './components/Lightning';
import SplitText from './components/SplitText';
import TextType from './components/TextType';
import BlurText from './components/BlurText';
import SpotlightCard from './components/SpotlightCard';

// Memoize expensive components
const MemoizedPromptInput = memo(PromptInput);
const MemoizedRefinementResults = memo(RefinementResults);
const MemoizedOutputDisplay = memo(OutputDisplay);

function App() {
  const { error } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const quotaRemaining = useStore(state => state.quotaRemaining);
  const usingUserKey = useStore(state => state.usingUserKey);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
      {/* Lightning Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Lightning
          hue={268}
          xOffset={-0.2}
          speed={1}
          intensity={0.9}
          size={1.9}
        />
      </div>

      {/* Landing Section */}
      <section id="landing" className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden z-10">
        <div className="z-20 text-center space-y-6 p-4 max-w-5xl mx-auto">
          {/* PromptForge Heading - stays visible after animation */}
          <div className="flex justify-center">
            <BlurText
              text="PromptForge"
              delay={100}
              animateBy="letters"
              direction="top"
              className="text-5xl md:text-8xl font-bold tracking-tighter text-white"
            />
          </div>

          {/* Better Prompts/Results - Typing effect */}
          <div className="text-3xl md:text-6xl font-bold tracking-tighter">
            <span className="text-white/90">Better </span>
            <TextType
              text={['Prompts', 'Results']}
              typingSpeed={100}
              deletingSpeed={50}
              pauseDuration={2000}
              initialDelay={1500}
              showCursor
              cursorCharacter="_"
              cursorBlinkDuration={0.5}
              className="text-cyan-400"
              as="span"
            />
          </div>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            The ultimate AI companion for crafting, refining, and perfecting your interactions with Large Language Models.
          </p>

          <div className="pt-8">
            <button
              onClick={() => document.getElementById('main-app')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 hover:scale-105"
            >
              <span className="text-sm font-medium tracking-widest uppercase text-white/80 group-hover:text-white">
                Start Forging
              </span>
              <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-2xl animate-bounce opacity-50">
                ↓
              </span>
            </button>
          </div>
        </div>


      </section>

      {/* Main Application - Simple Native Scroll */}
      <div id="main-app" className="relative z-10 flex flex-col min-h-screen bg-black/30 border-t border-white/5">

        {/* Header */}
        <header className="border-b border-white/10 bg-black/40 sticky top-0 z-50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <SplitText
                  text="PromptForge Studio"
                  className="text-2xl font-bold tracking-tighter"
                  delay={40}
                  duration={1.5}
                  tag="h1"
                  textAlign="left"
                />
              </div>
              <div className="flex items-center gap-4">
                {!usingUserKey && quotaRemaining !== undefined && (
                  <span className="hidden sm:inline-block px-3 py-1 bg-white/5 border border-white/10 text-white/80 text-xs rounded-full">
                    {quotaRemaining}/5 free requests today
                  </span>
                )}
                {usingUserKey && (
                  <span className="hidden sm:inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-full">
                    ✓ Using your API key
                  </span>
                )}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Settings</span>
                  <span>⚙️</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Workflow - Simple Vertical Layout */}
        <main className="flex-grow py-8 md:py-12">
          {/* Error Display */}
          {error && (
            <div className="max-w-5xl mx-auto px-4 mb-8">
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <span className="text-sm font-medium">{error}</span>
                <button
                  onClick={() => useStore.getState().setError(null)}
                  className="ml-auto text-red-300/60 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto px-4 space-y-8">
            {/* Prompt Input */}
            <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)" className="border-white/5 bg-black/40">
              <MemoizedPromptInput />
            </SpotlightCard>

            {/* Refinement Results */}
            <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.15)" className="border-white/5 bg-black/40">
              <MemoizedRefinementResults />
            </SpotlightCard>

            {/* Output Display */}
            <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.15)" className="border-white/5 bg-black/40">
              <MemoizedOutputDisplay />
            </SpotlightCard>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-black/40 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center gap-4 mb-4 opacity-50">
              <span className="text-xs px-2 py-1 border border-white/20 rounded">Gemini 2.0</span>
              <span className="text-xs px-2 py-1 border border-white/20 rounded">Llama 3.3</span>
            </div>
            <p className="text-gray-500 text-sm">
              Built with Cloudflare Workers • Zero-cost infrastructure
            </p>
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;
