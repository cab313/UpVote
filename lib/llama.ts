// =============================================================================
// Llama API Service
// =============================================================================
// Server-side only service for interacting with Meta's public Llama API
//
// IMPORTANT SECURITY NOTES:
// - This file should ONLY be imported in server-side code (API routes, server components)
// - NEVER import this file in client components
// - The API key is stored in LLAMA_API_KEY environment variable
// - All API calls are made from the server to protect the API key
//
// HOW TO OBTAIN A LLAMA API KEY:
// 1. Visit https://llama.developer.meta.com
// 2. Sign in with your Meta account or create one
// 3. Navigate to the API Keys section
// 4. Click "Generate New Key"
// 5. Copy the key (format: LLM|<app_id>|<secret>)
// 6. Add to your .env.local: LLAMA_API_KEY=your_key_here
//
// API Documentation: https://llama.developer.meta.com/docs
// =============================================================================

const LLAMA_API_URL = 'https://api.llama.com/v1/chat/completions';
const LLAMA_MODEL = 'Llama-3.3-70B-Instruct';

interface LlamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LlamaResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

/**
 * Make a request to the Llama API
 * @param messages - Array of messages for the chat completion
 * @returns The assistant's response content
 * @throws Error if API key is missing or request fails
 */
async function callLlamaAPI(messages: LlamaMessage[]): Promise<string> {
  const apiKey = process.env.LLAMA_API_KEY;

  if (!apiKey) {
    throw new Error(
      'LLAMA_API_KEY environment variable is not set. ' +
      'Get your API key from https://llama.developer.meta.com'
    );
  }

  const response = await fetch(LLAMA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: LLAMA_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Llama API request failed (${response.status}): ${errorText}`
    );
  }

  const data: LlamaResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('Llama API returned no choices');
  }

  return data.choices[0].message.content;
}

/**
 * Generate a concise summary of a feature request
 * @param title - The feature request title
 * @param description - The full feature request description
 * @returns A concise 1-2 sentence summary
 */
export async function summarizeRequest(
  title: string,
  description: string
): Promise<string> {
  const messages: LlamaMessage[] = [
    {
      role: 'system',
      content: `You are a helpful assistant that summarizes feature requests.
Create a concise 1-2 sentence summary that captures the key ask and business value.
Be direct and professional. Do not use phrases like "The user wants" - just state what the feature is.
Keep the summary under 150 characters if possible.`,
    },
    {
      role: 'user',
      content: `Summarize this feature request:

Title: ${title}

Description:
${description}`,
    },
  ];

  try {
    const summary = await callLlamaAPI(messages);
    return summary.trim();
  } catch (error) {
    console.error('Failed to generate summary:', error);
    // Return a fallback based on the title if AI fails
    return `Feature request: ${title}`;
  }
}

interface FeatureRequestForComparison {
  id: string;
  title: string;
  description: string;
}

/**
 * Detect potential duplicate feature requests
 * @param newRequest - The new feature request to check
 * @param existingRequests - Array of existing requests to compare against
 * @returns Array of IDs of similar requests (>80% semantic similarity)
 */
export async function detectDuplicates(
  newRequest: { title: string; description: string },
  existingRequests: FeatureRequestForComparison[]
): Promise<string[]> {
  if (existingRequests.length === 0) {
    return [];
  }

  // Create a formatted list of existing requests for comparison
  const existingList = existingRequests
    .map((req, index) => `[${index}] ID: ${req.id}\nTitle: ${req.title}\nDescription: ${req.description.substring(0, 300)}...`)
    .join('\n\n');

  const messages: LlamaMessage[] = [
    {
      role: 'system',
      content: `You are an expert at detecting duplicate or highly similar feature requests.
Your task is to identify which existing requests are semantically similar (80%+ overlap in meaning) to a new request.
Consider:
- Core functionality being requested
- Problem being solved
- Similar use cases even if worded differently

Respond with ONLY a JSON array of the IDs of similar requests, e.g., ["id1", "id2"]
If no similar requests are found, respond with an empty array: []
Do not include any other text in your response.`,
    },
    {
      role: 'user',
      content: `NEW REQUEST:
Title: ${newRequest.title}
Description: ${newRequest.description}

EXISTING REQUESTS:
${existingList}

Which existing requests are 80%+ similar to the new request? Return only the IDs as a JSON array.`,
    },
  ];

  try {
    const response = await callLlamaAPI(messages);

    // Parse the JSON array from the response
    const cleanedResponse = response.trim();

    // Try to extract JSON array from the response
    const jsonMatch = cleanedResponse.match(/\[.*?\]/s);
    if (!jsonMatch) {
      return [];
    }

    const duplicateIds: string[] = JSON.parse(jsonMatch[0]);

    // Validate that the returned IDs exist in our list
    const validIds = duplicateIds.filter(id =>
      existingRequests.some(req => req.id === id)
    );

    return validIds;
  } catch (error) {
    console.error('Failed to detect duplicates:', error);
    // Return empty array on error - don't block submission
    return [];
  }
}

/**
 * Placeholder for email notification service
 * This is scaffolded for future implementation
 */
export async function notifySubscribers(
  requestId: string,
  eventType: 'status_change' | 'new_comment' | 'merged'
): Promise<void> {
  // TODO: Implement email notifications
  // This would integrate with a service like SendGrid, Postmark, or Resend
  console.log(`[Notification Placeholder] Event: ${eventType} for request ${requestId}`);
}
