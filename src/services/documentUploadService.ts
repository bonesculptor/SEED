import { supabase } from '../lib/supabase';
import { documentExtractionService } from './documentExtractionService';
import { quickDocumentExtraction } from './quickDocumentExtraction';

interface UploadResult {
  success: boolean;
  fileId?: string;
  message: string;
  extractedData?: any;
  did?: string;
  recordCount?: number;
}

class DocumentUploadService {
  async uploadDocument(file: File): Promise<UploadResult> {
    try {
      console.log('Starting upload for:', file.name);

      const tempId = `temp-${Date.now()}`;

      setTimeout(async () => {
        try {
          console.log('Background: Processing file...');
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          const { data, error } = await supabase
            .from('document_files')
            .insert([{
              filename: file.name,
              file_type: file.type,
              file_size: file.size,
              file_data: uint8Array,
              user_id: null,
              metadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString()
              }
            }])
            .select('id, filename, file_type, file_size')
            .maybeSingle();

          if (error) {
            console.error('Background upload error:', error);
            return;
          }

          if (data) {
            console.log('Document stored in database, ID:', data.id);

            setTimeout(() => {
              this.processExtractionAsync(data.id, arrayBuffer, file.type, file.name).catch(err => {
                console.error('Background extraction failed:', err);
              });
            }, 500);
          }
        } catch (err) {
          console.error('Background processing error:', err);
        }
      }, 100);

      return {
        success: true,
        fileId: tempId,
        message: 'Document upload initiated!\n\nProcessing in background...\n\nRecords will appear shortly. You can also add records manually now.',
        extractedData: null
      };
    } catch (error) {
      console.error('Error initiating upload:', error);
      return {
        success: false,
        message: `Upload error: ${error}`
      };
    }
  }

  private async processExtractionAsync(
    fileId: string,
    arrayBuffer: ArrayBuffer,
    fileType: string,
    fileName: string
  ): Promise<void> {
    try {
      console.log('Starting quick extraction for file:', fileId);

      const result = await quickDocumentExtraction.extractAndCreateRecords(fileId);

      if (result.success) {
        console.log(`✅ ${result.message}`);
      } else {
        console.error('Quick extraction failed:', result.message);
      }
    } catch (error) {
      console.error('Background extraction error:', error);
      await supabase
        .from('document_files')
        .update({
          metadata: {
            extracted: false,
            error: String(error),
            extractedAt: new Date().toISOString()
          }
        })
        .eq('id', fileId);
    }
  }

  async getDocument(fileId: string): Promise<Blob | null> {
    try {
      const { data, error } = await supabase
        .from('document_files')
        .select('file_data, file_type')
        .eq('id', fileId)
        .single();

      if (error || !data) {
        console.error('Error fetching document:', error);
        return null;
      }

      return new Blob([data.file_data], { type: data.file_type });
    } catch (error) {
      console.error('Error in getDocument:', error);
      return null;
    }
  }

  async listDocuments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('document_files')
        .select('id, filename, file_type, file_size, uploaded_at, metadata')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error listing documents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in listDocuments:', error);
      return [];
    }
  }

  async deleteDocument(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('document_files')
        .delete()
        .eq('id', fileId);

      if (error) {
        console.error('Error deleting document:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteDocument:', error);
      return false;
    }
  }

  async linkDocumentToProtocol(fileId: string, protocolId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('document_files')
        .update({ protocol_id: protocolId })
        .eq('id', fileId);

      if (error) {
        console.error('Error linking document:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in linkDocumentToProtocol:', error);
      return false;
    }
  }

  async getExtractionStatus(fileId: string): Promise<{
    extracted: boolean;
    recordCount?: number;
    did?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('document_files')
        .select('metadata')
        .eq('id', fileId)
        .single();

      if (error || !data) {
        return { extracted: false };
      }

      const metadata = data.metadata as any;
      return {
        extracted: metadata.extracted || false,
        recordCount: metadata.recordCount,
        did: metadata.did,
        error: metadata.error
      };
    } catch (error) {
      console.error('Error getting extraction status:', error);
      return { extracted: false };
    }
  }
}

export const documentUploadService = new DocumentUploadService();
