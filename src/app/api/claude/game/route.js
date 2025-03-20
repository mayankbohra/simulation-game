import { Anthropic } from '@anthropic-ai/sdk';
import { MURDER_MYSTERY_PROMPT } from '@/app/prompt';

export async function POST(request) {
    try {
        const body = await request.json();
        const { message, history } = body;

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check API key
        if (!process.env.ANTHROPIC_API_KEY) {
            console.error('Missing Anthropic API key');
            return new Response(JSON.stringify({
                error: 'API configuration error',
                details: 'Anthropic API key is not configured'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Initialize Anthropic client
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
            timeout: 60000, // 60 seconds timeout
        });

        // Filter out system messages from history
        const filteredHistory = history ? history.filter(msg => msg.role !== 'system') : [];

        // Call Anthropic API with system as a top-level parameter
        const completion = await anthropic.messages.create({
            model: 'claude-3-7-sonnet-20250219',
            system: MURDER_MYSTERY_PROMPT,
            messages: [
                ...filteredHistory,
                { role: 'user', content: message }
            ],
            temperature: 0.3,
            max_tokens: 1500,
        });

        const responseText = completion.content[0].text;

        return new Response(JSON.stringify({ response: responseText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        // More detailed error logging
        console.error('Detailed Anthropic API Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            // Additional error details if available
            ...(error.response ? {
                status: error.response.status,
                data: error.response.data
            } : {})
        });

        let status = 500;
        let errorResponse = {
            error: 'Unexpected Error',
            details: error.message || 'An unexpected error occurred while processing your request'
        };

        if (error.name === 'APIConnectionError') {
            status = 503;
            errorResponse = {
                error: 'Network Error',
                details: 'Unable to connect to the AI service. Please check your internet connection.'
            };
        } else if (error.name === 'AuthenticationError') {
            status = 401;
            errorResponse = {
                error: 'Authentication Failed',
                details: 'Invalid or expired API credentials'
            };
        }

        return new Response(JSON.stringify(errorResponse), {
            status: status,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
