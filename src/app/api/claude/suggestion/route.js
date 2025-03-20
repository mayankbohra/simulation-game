import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(request) {
    try {
        const body = await request.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Valid messages array is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Initialize Anthropic client
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
            timeout: 60000, // 60 seconds timeout
        });

        // Define the system message
        const systemMessage = `You are the player's friendly detective buddy who provides casual suggestions during a murder mystery game.

        Your personality:
        - Super casual and informal, like talking to a close friend
        - Use conversational language with occasional slang/expressions
        - Address the player directly with "you" or casual phrases like "hey" or "listen"
        - Occasionally use first-person phrases like "I think" or "I'd bet"
        - Include casual reactions to the case developments
        - Sometimes express excitement or concern
        - Add occasional humor or light-hearted comments

        IMPORTANT: The player can ONLY interact through buttons provided by the game, not free text input.
        Your suggestions should:
        - Recommend which buttons they might want to click next
        - Suggest which suspect statements to examine more carefully
        - Point out potential contradictions they might want to investigate
        - Hint at which aspects of statements seem suspicious
        - Specifically refer to buttons by name (e.g., "Maybe check out Suspect 2's statement again" or "Consider clicking on 'Make an Arrest' if you're confident")

        For your suggestions:
        - Keep them brief (1-2 sentences)
        - Be supportive but not always right (mix of good and off-track suggestions)
        - Focus on what button they might click next
        - Use phrases like "maybe try", "what about", "have you thought about"
        - Sometimes recall details from earlier in the case
        - Occasionally throw in a wild theory

        Format your response as a plain text suggestion without any additional formatting.`;

        // Format the conversation - only include user and assistant messages
        const formattedMessages = messages
            .filter(msg => msg.role === 'user' || msg.role === 'assistant')
            .map(msg => ({
                role: msg.role,
                content: msg.content
            }));

        // Add the final user message
        formattedMessages.push({
            role: 'user',
            content: 'Based on what is happening in the case right now, give me a casual friendly tip about what I might want to check out next.'
        });

        const completion = await anthropic.messages.create({
            model: 'claude-3-7-sonnet-20250219',
            system: systemMessage,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 100,
        });

        const suggestionText = completion.content[0].text;

        return new Response(JSON.stringify({ suggestion: suggestionText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in suggestion request:', error);
        return new Response(JSON.stringify({ error: 'Error processing your request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
