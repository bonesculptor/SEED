import { supabase } from '../lib/supabase';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class LLMService {
  private async getApiKey(): Promise<string | null> {
    const { data, error } = await supabase
      .from('api_settings')
      .select('api_key')
      .eq('api_name', 'OpenAI')
      .eq('enabled', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching API key:', error);
      return null;
    }

    return data?.api_key || null;
  }

  async chat(messages: ChatMessage[], options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<LLMResponse> {
    const apiKey = await this.getApiKey();

    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add it in Settings.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'gpt-4',
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.max_tokens || 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
      }

      const data = await response.json();

      return {
        message: data.choices[0]?.message?.content || '',
        usage: data.usage,
      };
    } catch (error) {
      console.error('LLM chat error:', error);
      throw error;
    }
  }

  async analyzeWorkflow(workflowData: any): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert in agent workflow analysis. Analyze workflows and provide insights on:
- Efficiency and optimization
- Cynefin domain classifications
- Potential bottlenecks
- Ikigai score predictions
- Protocol compliance (HCP, BCP, MCP, DCP, GCP)
- Best practices and recommendations`,
      },
      {
        role: 'user',
        content: `Analyze this workflow and provide recommendations:\n\n${JSON.stringify(workflowData, null, 2)}`,
      },
    ];

    const response = await this.chat(messages);
    return response.message;
  }

  async extractStructuredData(text: string, prompt: string): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a data extraction assistant. Extract structured data from text and return valid JSON only. No markdown formatting, no explanations, just pure JSON.',
      },
      {
        role: 'user',
        content: `${prompt}\n\nText to extract from:\n${text}`,
      },
    ];

    try {
      const response = await this.chat(messages, { temperature: 0.1, max_tokens: 1000 });
      const jsonMatch = response.message.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch (error) {
      console.error('Error extracting structured data:', error);
      return {};
    }
  }

  async classifyCynefinDomain(problemDescription: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a Cynefin framework expert. Classify problems into domains:
- Clear: Best practices, known solutions
- Complicated: Good practices, expert analysis needed
- Complex: Emergent practices, probe-sense-respond
- Chaotic: Novel practices, act-sense-respond
- Confused: Unclear domain

Respond with the domain name and brief explanation.`,
      },
      {
        role: 'user',
        content: `Classify this problem into a Cynefin domain:\n\n${problemDescription}`,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.3 });
    return response.message;
  }

  async suggestAgentAssignment(taskDescription: string, availableAgents: any[]): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert in agent task assignment. Consider:
- Agent capabilities and Ikigai scores
- Task requirements and complexity
- Protocol alignment (HCP, BCP, MCP, DCP, GCP)
- Tier levels (1, 2, 3)
- Workload balance

Recommend the best agent for each task.`,
      },
      {
        role: 'user',
        content: `Task: ${taskDescription}\n\nAvailable Agents:\n${JSON.stringify(availableAgents, null, 2)}\n\nWhich agent should handle this task and why?`,
      },
    ];

    const response = await this.chat(messages);
    return response.message;
  }

  async generateProtocolInstance(protocolType: string, context: any): Promise<string> {
    const protocolDescriptions: Record<string, string> = {
      HCP: 'Human Context Protocol - captures user roles, intentions, permissions, and consent',
      BCP: 'Business Context Protocol - uses Business Model Canvas for business logic and value proposition',
      MCP: 'Machine Context Protocol - uses ML Canvas for machine learning model definitions',
      DCP: 'Data Context Protocol - uses Data Mesh architecture for data products and contracts',
      GCP: 'Governance Context Protocol - uses Cynefin framework and federated governance policies',
    };

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert in agent communication protocols. Generate properly formatted protocol instances following these specifications:\n\n${protocolDescriptions[protocolType] || 'Unknown protocol'}`,
      },
      {
        role: 'user',
        content: `Generate a ${protocolType} protocol instance for this context:\n\n${JSON.stringify(context, null, 2)}`,
      },
    ];

    const response = await this.chat(messages);
    return response.message;
  }

  async chatWithSystem(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are an AI assistant for an Agent Protocol System. You help users:
- Design agent workflows
- Understand protocols (HCP, BCP, MCP, DCP, GCP)
- Classify problems using Cynefin framework
- Manage Ikigai scores for agent well-being
- Implement Data Mesh architecture
- Apply governance policies
- Create projects and assign agents

Be helpful, concise, and provide actionable insights.`,
    };

    const messages: ChatMessage[] = [
      systemPrompt,
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await this.chat(messages, { max_tokens: 1000 });
    return response.message;
  }

  async validateProtocol(protocolType: string, protocolData: any): Promise<{ valid: boolean; issues: string[] }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a protocol validation expert. Validate protocol instances against their specifications. Return a JSON response with:
{
  "valid": true/false,
  "issues": ["issue1", "issue2", ...]
}`,
      },
      {
        role: 'user',
        content: `Validate this ${protocolType} protocol instance:\n\n${JSON.stringify(protocolData, null, 2)}`,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.2 });

    try {
      return JSON.parse(response.message);
    } catch {
      return {
        valid: false,
        issues: ['Failed to parse validation response'],
      };
    }
  }

  async explainConcept(concept: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful teacher explaining complex concepts in simple terms.',
      },
      {
        role: 'user',
        content: `Explain "${concept}" in the context of agent systems and protocols.`,
      },
    ];

    const response = await this.chat(messages, { max_tokens: 500 });
    return response.message;
  }
}

export const llmService = new LLMService();
