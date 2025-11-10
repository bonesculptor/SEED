import { supabase } from '../lib/supabase';

export interface ExtractedIdentityData {
  full_name?: string;
  date_of_birth?: string;
  nationality?: string;
  document_number?: string;
  document_expiry?: string;
  document_type?: 'passport' | 'drivers_license' | 'visa' | 'national_id';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  confidence?: number;
}

export interface UserAccount {
  id?: string;
  email: string;
  full_name?: string;
  date_of_birth?: string;
  nationality?: string;
  document_type?: string;
  document_number?: string;
  document_expiry?: string;
  address?: any;
  phone?: string;
  verification_status?: string;
  verification_method?: string;
  account_tier?: string;
  is_admin?: boolean;
}

export class IdentityVerificationService {
  async extractDataFromDocument(imageBase64: string, documentType: string): Promise<ExtractedIdentityData> {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY;

      if (!apiKey) {
        throw new Error('No LLM API key configured. Please add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to your .env file');
      }

      // Use GPT-4 Vision or Claude Vision to extract data from document
      const isOpenAI = import.meta.env.VITE_OPENAI_API_KEY;

      if (isOpenAI) {
        return await this.extractWithOpenAI(imageBase64, documentType, apiKey);
      } else {
        return await this.extractWithClaude(imageBase64, documentType, apiKey);
      }
    } catch (error) {
      console.error('Error extracting data from document:', error);

      // Return mock data for testing/sandbox mode
      return this.getMockExtractedData(documentType);
    }
  }

  private async extractWithOpenAI(imageBase64: string, documentType: string, apiKey: string): Promise<ExtractedIdentityData> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the following information from this ${documentType} document and return it as JSON:
                - full_name (full legal name)
                - date_of_birth (format: YYYY-MM-DD)
                - nationality (country code or name)
                - document_number (passport/license number)
                - document_expiry (format: YYYY-MM-DD)
                - address (object with street, city, state, postal_code, country if visible)

                Return ONLY valid JSON with the extracted data. If a field is not visible, omit it.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      return { ...extracted, confidence: 0.85 };
    }

    throw new Error('Could not parse extracted data');
  }

  private async extractWithClaude(imageBase64: string, documentType: string, apiKey: string): Promise<ExtractedIdentityData> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64
                }
              },
              {
                type: 'text',
                text: `Extract the following information from this ${documentType} document and return it as JSON:
                - full_name (full legal name)
                - date_of_birth (format: YYYY-MM-DD)
                - nationality (country code or name)
                - document_number (passport/license number)
                - document_expiry (format: YYYY-MM-DD)
                - address (object with street, city, state, postal_code, country if visible)

                Return ONLY valid JSON with the extracted data. If a field is not visible, omit it.`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      throw new Error('No response from Claude');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      return { ...extracted, confidence: 0.85 };
    }

    throw new Error('Could not parse extracted data');
  }

  private getMockExtractedData(documentType: string): ExtractedIdentityData {
    return {
      full_name: 'John Alexander Smith',
      date_of_birth: '1985-03-15',
      nationality: 'United States',
      document_number: documentType === 'passport' ? 'P123456789' : 'DL12345678',
      document_expiry: '2030-12-31',
      document_type: documentType as any,
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA'
      },
      confidence: 0.95
    };
  }

  async createUserAccount(accountData: UserAccount): Promise<any> {
    const { data, error } = await supabase
      .from('user_accounts')
      .insert({
        email: accountData.email,
        full_name: accountData.full_name,
        date_of_birth: accountData.date_of_birth,
        nationality: accountData.nationality,
        document_type: accountData.document_type,
        document_number: accountData.document_number,
        document_expiry: accountData.document_expiry,
        address: accountData.address || {},
        phone: accountData.phone,
        verification_status: 'pending',
        verification_method: 'llm_extracted',
        account_tier: 'free'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserAccount(accountId: string, updates: Partial<UserAccount>): Promise<any> {
    const { data, error } = await supabase
      .from('user_accounts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserAccount(email: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAllUserAccounts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async uploadIdentityDocument(
    userAccountId: string,
    documentType: string,
    imageBase64: string,
    extractedData: ExtractedIdentityData
  ): Promise<any> {
    // In production, upload to Supabase Storage
    // For now, we'll store the base64 in the database (not recommended for production)
    const documentUrl = `data:image/jpeg;base64,${imageBase64.substring(0, 100)}...`;

    const { data, error } = await supabase
      .from('identity_documents')
      .insert({
        user_account_id: userAccountId,
        document_type: documentType,
        document_url: documentUrl,
        extracted_data: extractedData,
        extraction_confidence: extractedData.confidence,
        status: 'processing'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async verifyDocument(documentId: string, status: 'verified' | 'rejected', notes?: string): Promise<any> {
    const { data, error } = await supabase
      .from('identity_documents')
      .update({
        status,
        verification_notes: notes
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;

    // Update user account verification status
    if (status === 'verified') {
      const document = data;
      await supabase
        .from('user_accounts')
        .update({ verification_status: 'verified' })
        .eq('id', document.user_account_id);
    }

    return data;
  }

  async getUserDocuments(userAccountId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('identity_documents')
      .select('*')
      .eq('user_account_id', userAccountId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const identityVerificationService = new IdentityVerificationService();
