import { Env, RefinementStage } from './types';

/**
 * LLM Orchestrator - manages calls to Gemini and Groq with fallback logic
 * Supports both server API keys and user-provided keys
 */

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const GENERATOR_PROMPT_TEMPLATE = `You are an expert prompt engineer. Your task is to rewrite the following user prompt to make it clearer, more specific, and more likely to produce high-quality outputs from an AI language model.

Guidelines:
1. Add necessary context if missing
2. Structure complex requests into numbered steps
3. Specify desired output format (e.g., "in bullet points", "as a table")
4. Include relevant constraints (length, audience level, tone)
5. Preserve the user's core intent—do not add requirements they didn't ask for

Original Prompt:
"""
{user_prompt}
"""

Provide ONLY the refined prompt, without any explanations or meta-commentary:`;

const OUTPUT_GENERATION_TEMPLATE = `{refined_prompt}`;

/**
 * Call Gemini API with provided key
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                topP: 0.9,
                topK: 40,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ]
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini returned no candidates');
    }

    return data.candidates[0].content.parts[0].text;
}

/**
 * Call Groq API with provided key
 */
async function callGroq(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.9
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
}

/**
 * Track daily LLM usage in KV store (only for server keys)
 */
async function trackLLMUsage(env: Env, provider: 'gemini' | 'groq'): Promise<number> {
    // Skip tracking if CACHE is not available (local dev)
    if (!env.CACHE) {
        return 0;
    }

    const today = new Date().toISOString().split('T')[0];
    const key = `llm_usage:${provider}:${today}`;

    const current = await env.CACHE.get(key);
    const count = current ? parseInt(current) : 0;
    const newCount = count + 1;

    await env.CACHE.put(key, newCount.toString(), { expirationTtl: 86400 }); // 24 hours

    return newCount;
}

/**
 * Refine prompt using LLM with automatic fallback
 * @param userPrompt - The prompt to refine
 * @param env - Cloudflare environment bindings
 * @param userApiKey - Optional user-provided API key (Gemini or Groq)
 */
export async function refinePrompt(
    userPrompt: string,
    env: Env,
    userApiKey?: string
): Promise<{
    refined_prompt: string;
    stages: RefinementStage[];
    model: string;
    using_user_key: boolean;
}> {
    const generatorPrompt = GENERATOR_PROMPT_TEMPLATE.replace('{user_prompt}', userPrompt);

    let refinedPrompt: string;
    let model: string;
    let usingUserKey = false;

    // If user provided their own API key, use it directly
    if (userApiKey) {
        usingUserKey = true;
        try {
            // Try as Gemini key first
            refinedPrompt = await callGemini(generatorPrompt, userApiKey);
            model = 'gemini-2.0-flash (user key)';
        } catch (geminiError) {
            // If Gemini fails, try as Groq key
            try {
                refinedPrompt = await callGroq(generatorPrompt, userApiKey);
                model = 'llama-3.3-70b-groq (user key)';
            } catch (groqError) {
                throw new Error('Invalid API key. Please check your Gemini or Groq API key.');
            }
        }
    } else {
        // Use server API keys with fallback logic
        try {
            const geminiUsage = await trackLLMUsage(env, 'gemini');

            if (geminiUsage < 1400) { // Leave buffer
                refinedPrompt = await callGemini(generatorPrompt, env.GEMINI_API_KEY);
                model = 'gemini-2.0-flash';
            } else {
                // Switch to Groq if Gemini limit reached
                refinedPrompt = await callGroq(generatorPrompt, env.GROQ_API_KEY);
                model = 'llama-3.3-70b-groq';
                await trackLLMUsage(env, 'groq');
            }
        } catch (error) {
            // Fallback to Groq on Gemini error
            console.error('Gemini failed, falling back to Groq:', error);
            refinedPrompt = await callGroq(generatorPrompt, env.GROQ_API_KEY);
            model = 'llama-3.3-70b-groq';
            await trackLLMUsage(env, 'groq');
        }
    }

    const stages: RefinementStage[] = [
        {
            stage: 'generator',
            output: refinedPrompt,
            reasoning: 'Improved clarity, specificity, and structure'
        }
    ];

    return {
        refined_prompt: refinedPrompt.trim(),
        stages,
        model,
        using_user_key: usingUserKey
    };
}

/**
 * Generate output from refined prompt
 * @param refinedPrompt - The refined prompt
 * @param env - Cloudflare environment bindings
 * @param userApiKey - Optional user-provided API key
 */
export async function generateOutput(
    refinedPrompt: string,
    env: Env,
    userApiKey?: string
): Promise<{
    output: string;
    model: string;
    tokens: number;
    using_user_key: boolean;
}> {
    const outputPrompt = OUTPUT_GENERATION_TEMPLATE.replace('{refined_prompt}', refinedPrompt);

    let output: string;
    let model: string;
    let usingUserKey = false;

    // If user provided their own API key, use it directly
    if (userApiKey) {
        usingUserKey = true;
        try {
            output = await callGemini(outputPrompt, userApiKey);
            model = 'gemini-2.0-flash (user key)';
        } catch (geminiError) {
            try {
                output = await callGroq(outputPrompt, userApiKey);
                model = 'llama-3.3-70b-groq (user key)';
            } catch (groqError) {
                throw new Error('Invalid API key. Please check your Gemini or Groq API key.');
            }
        }
    } else {
        // Use server API keys
        try {
            const geminiUsage = await trackLLMUsage(env, 'gemini');

            if (geminiUsage < 1400) {
                output = await callGemini(outputPrompt, env.GEMINI_API_KEY);
                model = 'gemini-2.0-flash';
            } else {
                output = await callGroq(outputPrompt, env.GROQ_API_KEY);
                model = 'llama-3.3-70b-groq';
                await trackLLMUsage(env, 'groq');
            }
        } catch (error) {
            console.error('Gemini failed, falling back to Groq:', error);
            output = await callGroq(outputPrompt, env.GROQ_API_KEY);
            model = 'llama-3.3-70b-groq';
            await trackLLMUsage(env, 'groq');
        }
    }

    return {
        output: output.trim(),
        model,
        tokens: Math.ceil(output.length / 4), // Rough estimate
        using_user_key: usingUserKey
    };
}
