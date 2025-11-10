import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, User, Calendar, MapPin, CreditCard } from 'lucide-react';
import { identityVerificationService, ExtractedIdentityData } from '../services/identityVerificationService';
import { SectorThemeSelector } from './SectorThemeSelector';

export function ThemedIdentityVerification({ onComplete }: { onComplete: (accountId: string) => void }) {
  const [step, setStep] = useState<'upload' | 'review' | 'processing' | 'complete'>('upload');
  const [documentType, setDocumentType] = useState<'passport' | 'drivers_license' | 'visa' | 'national_id'>('passport');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedIdentityData | null>(null);
  const [editedData, setEditedData] = useState<any>({});
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !email) {
      setError('Please upload a document and provide your email');
      return;
    }

    setProcessing(true);
    setStep('processing');
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const extracted = await identityVerificationService.extractDataFromDocument(base64, documentType);
        setExtractedData(extracted);
        setEditedData({
          email,
          phone,
          full_name: extracted.full_name,
          date_of_birth: extracted.date_of_birth,
          nationality: extracted.nationality,
          document_type: documentType,
          document_number: extracted.document_number,
          document_expiry: extracted.document_expiry,
          address: extracted.address
        });
        setStep('review');
        setProcessing(false);
      };
      reader.readAsDataURL(imageFile);
    } catch (err) {
      setError((err as Error).message);
      setProcessing(false);
      setStep('upload');
    }
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const account = await identityVerificationService.createUserAccount(editedData);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        await identityVerificationService.uploadIdentityDocument(
          account.id,
          documentType,
          base64,
          extractedData!
        );
        setStep('complete');
        setProcessing(false);
        setTimeout(() => {
          onComplete(account.id);
        }, 2000);
      };
      if (imageFile) {
        reader.readAsDataURL(imageFile);
      }
    } catch (err) {
      setError((err as Error).message);
      setProcessing(false);
    }
  };

  const handleEdit = (field: string, value: any) => {
    setEditedData({ ...editedData, [field]: value });
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--primary-500)', opacity: 0.15 }}>
            <Loader className="w-10 h-10 animate-spin" style={{ color: 'var(--primary-500)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Processing Document</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Our AI is extracting information from your identity document...
          </p>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#4CAF50', opacity: 0.15 }}>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Account Created!</h2>
          <p style={{ color: 'var(--color-text-muted)' }} className="mb-6">
            Your account has been created successfully. You can now access all features.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="absolute top-6 right-6">
            <SectorThemeSelector />
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
            <div className="p-8" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Review Extracted Information</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Please verify the information extracted from your document and make any necessary corrections.
              </p>
              {extractedData?.confidence && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    Extraction confidence: {(extractedData.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedData.full_name || ''}
                    onChange={(e) => handleEdit('full_name', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      borderWidth: '1px',
                      color: 'var(--color-text)',
                      outlineColor: 'var(--primary-500)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editedData.date_of_birth || ''}
                    onChange={(e) => handleEdit('date_of_birth', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      borderWidth: '1px',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={editedData.nationality || ''}
                    onChange={(e) => handleEdit('nationality', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      borderWidth: '1px',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={editedData.document_number || ''}
                    onChange={(e) => handleEdit('document_number', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      borderWidth: '1px',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Document Expiry
                  </label>
                  <input
                    type="date"
                    value={editedData.document_expiry || ''}
                    onChange={(e) => handleEdit('document_expiry', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      borderWidth: '1px',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editedData.phone || ''}
                    onChange={(e) => handleEdit('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      borderWidth: '1px',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#EF535020', borderColor: '#EF535040', borderWidth: '1px' }}>
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setStep('upload')}
                  disabled={processing}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-text)' }}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--primary-500)', color: '#111' }}
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm & Create Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="absolute top-6 right-6">
          <SectorThemeSelector />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
          <div className="p-8" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Create Account with Identity Verification</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Upload your identity document to get started. We use AI to securely extract your information.
            </p>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>Document Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'passport', label: 'Passport', icon: FileText },
                  { value: 'drivers_license', label: 'Driver License', icon: CreditCard },
                  { value: 'national_id', label: 'National ID', icon: User },
                  { value: 'visa', label: 'Visa', icon: FileText }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setDocumentType(type.value as any)}
                    className="px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3"
                    style={{
                      borderColor: documentType === type.value ? 'var(--primary-500)' : 'var(--color-border)',
                      backgroundColor: documentType === type.value ? 'var(--primary-500)' : 'var(--color-bg)',
                      color: documentType === type.value ? '#111' : 'var(--color-text-muted)',
                      opacity: documentType === type.value ? 1 : 0.6
                    }}
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>Upload Document</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-6 py-8 border-2 border-dashed rounded-lg transition-colors group"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">Click to change document</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-3 transition-colors" style={{ color: 'var(--color-text-muted)' }} />
                    <p style={{ color: 'var(--color-text-muted)' }} className="font-medium mb-1">Click to upload or drag and drop</p>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm opacity-70">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#EF535020', borderColor: '#EF535040', borderWidth: '1px' }}>
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="rounded-lg p-4 mb-6 flex items-start gap-3" style={{ backgroundColor: 'var(--primary-500)', opacity: 0.15, borderColor: 'var(--primary-500)', borderWidth: '1px' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary-300)' }} />
              <div className="text-sm" style={{ color: 'var(--primary-300)' }}>
                <p className="font-medium mb-1">Test Mode Active</p>
                <p style={{ opacity: 0.8 }}>
                  This is a sandbox environment. No real data is processed. The AI will generate sample extracted data for testing.
                </p>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!imageFile || !email || processing}
              className="w-full px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--primary-500)', color: '#111' }}
            >
              {processing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Extract Information with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
