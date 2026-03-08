/**
 * Shared AI client and utilities.
 * All AI module files import from here.
 *
 * When Vertex AI is configured (GCP_PROJECT_ID set), uses Vertex AI SDK.
 * Otherwise falls back to the direct @google/generative-ai SDK (existing behavior).
 */
import { isVertexAIEnabled } from '../featureFlags';


/**
 * Unified model interface for both Vertex AI and direct Gemini SDK.
 * Provides a consistent API regardless of the backing service.
 */
export interface UnifiedModel {
    generateContent(request: string | Array<string | { inlineData: { data: string; mimeType: string } }>): Promise<{
        response: { text: () => string };
    }>;
}

/**
 * Get a Gemini model instance.
 * - If Vertex AI is configured → uses Vertex AI SDK
 * - Otherwise → uses direct @google/generative-ai SDK (existing behavior)
 */
export function getModel(): UnifiedModel {
    if (isVertexAIEnabled()) {
        return getVertexModelWrapper();
    }
    return getDirectGeminiModel();
}

// ─── Vertex AI Model Wrapper ────────────────────────────────────────────────

function getVertexModelWrapper(): UnifiedModel {
    return {
        async generateContent(request) {
            // Lazy dynamic import to avoid loading Vertex AI SDK when not needed
            const { getVertexModel, withRetry } = await import('./vertexClient');
            const vertexModel = getVertexModel();
            return withRetry(async () => {
                let parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }>;

                if (typeof request === 'string') {
                    parts = [{ text: request }];
                } else if (Array.isArray(request)) {
                    parts = request.map((item) => {
                        if (typeof item === 'string') return { text: item };
                        return item;
                    });
                } else {
                    parts = [{ text: String(request) }];
                }

                const result = await vertexModel.generateContent({
                    contents: [{ role: 'user', parts }],
                });

                const response = await result.response;
                const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

                return {
                    response: {
                        text: () => text,
                    },
                };
            });
        },
    };
}

// ─── Direct Gemini SDK Model (existing behavior) ───────────────────────────

function getDirectGeminiModel(): UnifiedModel {
    return {
        async generateContent(request) {
            // Dynamic import for ESLint compliance
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(request);
            return {
                response: {
                    text: () => result.response.text(),
                },
            };
        },
    };
}

/**
 * Clean a Gemini response that may contain markdown code fences.
 * Strips ```json and ``` wrappers, trims whitespace.
 */
export function cleanJsonResponse(text: string): string {
    return text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
}

/**
 * Generate streaming content for chatbot-like responses.
 * Uses Vertex AI streaming when available, otherwise simulates with full response.
 */
export async function* generateStreamingContent(
    prompt: string
): AsyncGenerator<string> {
    if (isVertexAIEnabled()) {
        const { getVertexModel } = await import('./vertexClient');
        const vertexModel = getVertexModel();

        const streamResult = await vertexModel.generateContentStream({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        for await (const chunk of streamResult.stream) {
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
        }
    } else {
        // Fallback: generate full response and yield it as a single chunk
        const model = getModel();
        const result = await model.generateContent(prompt);
        yield result.response.text();
    }
}
