import OpenAI from 'openai';

class LLMService {
  constructor() {
    this.openai = null;
    this.initialized = false;
  }

  // Initialize Groq client when needed
  getClient() {
    // Check if we already have a client
    if (this.openai && this.initialized) {
      return this.openai;
    }

    // Get API key from environment
    const apiKey = process.env.GROQ_API_KEY;
    
    if (apiKey && apiKey !== 'gsk_your_actual_groq_key_here') {
      this.openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      this.initialized = true;
      console.log('✅ Groq client initialized successfully');
      return this.openai;
    } else {
      console.error('❌ GROQ_API_KEY not found or still using placeholder');
      console.log('Current env GROQ_API_KEY:', apiKey ? 'exists (starts with: ' + apiKey.substring(0, 10) + '...)' : 'NOT FOUND');
      return null;
    }
  }

  async processMeeting(transcript) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Groq API not configured. Please set GROQ_API_KEY in .env');
    }

    const prompt = this.buildAnalysisPrompt(transcript);
    
    try {
      const response = await this.callGroq(client, prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Groq processing failed:', error);
      throw new Error(`Failed to process meeting: ${error.message}`);
    }
  }

  buildAnalysisPrompt(transcript) {
    return `You are an expert meeting analyzer. Process the following meeting transcript and provide a structured analysis.

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Generate a 3-4 sentence summary capturing the key discussion points
2. Extract ALL action items mentioned, including:
   - Task description (be specific and clear)
   - Person assigned (ONLY if explicitly mentioned in the transcript)
   - Deadline (if mentioned, convert relative dates like "next week" to actual dates)
3. Identify key decisions made during the meeting
4. Be precise and factual - do not infer information not present in the transcript
5. If no specific person is assigned to a task, use "Unassigned"

IMPORTANT: You must respond with ONLY a valid JSON object. No markdown, no code blocks, no additional text. Just the JSON.

{
  "summary": "3-4 sentence professional summary here",
  "action_items": [
    {
      "description": "Clear task description",
      "assignee": "Person name or 'Unassigned'",
      "deadline": "Specific date or null"
    }
  ],
  "decisions": ["decision 1", "decision 2"]
}`;
  }

  async callGroq(client, prompt) {
    try {
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a precise meeting analysis assistant. Always respond with valid JSON only. Never include markdown formatting or explanatory text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Free tier allows 30 requests per minute. Please wait and try again.');
      } else if (error.status === 401 || error.status === 403) {
        throw new Error('Invalid API key. Please check your GROQ_API_KEY.');
      }
      throw error;
    }
  }

  parseResponse(response) {
    try {
      const parsed = JSON.parse(response);
      
      return {
        summary: parsed.summary || 'No summary available',
        action_items: (parsed.action_items || []).map(item => ({
          description: item.description || 'No description',
          assignee: item.assignee || 'Unassigned',
          deadline: item.deadline || null
        })),
        decisions: parsed.decisions || []
      };
    } catch (error) {
      console.error('Failed to parse Groq response:', response);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary || 'No summary available',
            action_items: (parsed.action_items || []).map(item => ({
              description: item.description || 'No description',
              assignee: item.assignee || 'Unassigned',
              deadline: item.deadline || null
            })),
            decisions: parsed.decisions || []
          };
        } catch (e) {
          throw new Error('Failed to parse response as JSON');
        }
      }
      
      throw new Error('Invalid response format from Groq');
    }
  }

  async generateFollowUpEmail(summary, actionItems, decisions) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Groq API not configured');
    }

    const prompt = `Generate a professional follow-up email based on the meeting details below.

Meeting Summary:
${summary}

Action Items:
${actionItems.map((item, i) => 
  `${i + 1}. ${item.description} - Assigned to: ${item.assignee}${item.deadline ? ` - Due: ${item.deadline}` : ''}`
).join('\n')}

Key Decisions:
${decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

Write a professional, warm follow-up email that:
1. Thanks everyone for their time and participation
2. Summarizes the key discussion points
3. Lists action items clearly with assignees and deadlines
4. Mentions decisions made
5. Includes next steps or next meeting time if relevant
6. Maintains a collaborative and encouraging tone

Format the email in proper markdown. Use "Hi Team," as the opening and end with "Best regards," followed by the team lead's signature.`;
    
    try {
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional email writer. Write clear, warm, and professional follow-up emails in markdown format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`Failed to generate email: ${error.message}`);
    }
  }

  async chatWithMeeting(transcript, question) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Groq API not configured');
    }

    const prompt = `Based on the following meeting transcript, answer the question accurately.

MEETING TRANSCRIPT:
${transcript}

QUESTION:
${question}

INSTRUCTIONS:
- Answer based ONLY on information present in the transcript
- If the answer cannot be found in the transcript, say: "I couldn't find that information in the meeting transcript."
- Be concise and direct in your response
- If referring to specific people, dates, or decisions, be precise
- Do not make up information that isn't in the transcript`;
    
    try {
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions based on meeting transcripts. Only use information from the provided transcript.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`Failed to chat with meeting: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
const llmService = new LLMService();
export default llmService;