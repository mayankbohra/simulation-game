import { OpenAI } from 'openai';
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
        if (!process.env.OPENAI_API_KEY) {
            console.error('Missing OpenAI API key');
            return new Response(JSON.stringify({
                error: 'API configuration error',
                details: 'OpenAI API key is not configured'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            timeout: 60000, // 60 seconds timeout
        });

        // Prepare conversation history for the API
        const messages = [
            { role: 'system', content: MURDER_MYSTERY_PROMPT },
            ...(history || []),
            { role: 'user', content: message }
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            temperature: 0.3,
            max_tokens: 1500,
        });

        const responseText = completion.choices[0].message.content;

        return new Response(JSON.stringify({ response: responseText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        // More detailed error logging
        console.error('Detailed OpenAI API Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            // Additional error details if available
            ...(error.response ? {
                status: error.response.status,
                data: error.response.data
            } : {})
        });

        // Differentiate between different types of errors
        if (error.name === 'APIConnectionError') {
            return new Response(JSON.stringify({
                error: 'Network Error',
                details: 'Unable to connect to the AI service. Please check your internet connection.'
            }), {
                status: 503, // Service Unavailable
                headers: { 'Content-Type': 'application/json' },
            });
        } else if (error.name === 'AuthenticationError') {
            return new Response(JSON.stringify({
                error: 'Authentication Failed',
                details: 'Invalid or expired API credentials'
            }), {
                status: 401, // Unauthorized
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Generic error response
        return new Response(JSON.stringify({
            error: 'Unexpected Error',
            details: error.message || 'An unexpected error occurred while processing your request'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
