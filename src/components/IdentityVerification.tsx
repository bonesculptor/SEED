import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, User, Calendar, MapPin, CreditCard } from 'lucide-react';
import { identityVerificationService, ExtractedIdentityData } from '../services/identityVerificationService';

export function IdentityVerification({ onComplete }: { onComplete: (accountId: string) => void }) {
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
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];

        // Extract data using LLM
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
      // Create user account
      const account = await identityVerificationService.createUserAccount(editedData);

      // Upload document
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
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Loader className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Processing Document</h2>
          <p className="text-slate-400">
            Our AI is extracting information from your identity document...
          </p>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-slate-400 mb-6">
            Your account has been created successfully. You can now access all features.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="min-h-screen bg-[#0f1419] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-2">Review Extracted Information</h2>
              <p className="text-slate-400">
                Please verify the information extracted from your document and make any necessary corrections.
              </p>
              {extractedData?.confidence && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-400">
                    Extraction confidence: {(extractedData.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedData.full_name || ''}
                    onChange={(e) => handleEdit('full_name', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editedData.date_of_birth || ''}
                    onChange={(e) => handleEdit('date_of_birth', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={editedData.nationality || ''}
                    onChange={(e) => handleEdit('nationality', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={editedData.document_number || ''}
                    onChange={(e) => handleEdit('document_number', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Document Expiry
                  </label>
                  <input
                    type="date"
                    value={editedData.document_expiry || ''}
                    onChange={(e) => handleEdit('document_expiry', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editedData.phone || ''}
                    onChange={(e) => handleEdit('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {editedData.address && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street"
                      value={editedData.address.street || ''}
                      onChange={(e) => handleEdit('address', { ...editedData.address, street: e.target.value })}
                      className="px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={editedData.address.city || ''}
                      onChange={(e) => handleEdit('address', { ...editedData.address, city: e.target.value })}
                      className="px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={editedData.address.state || ''}
                      onChange={(e) => handleEdit('address', { ...editedData.address, state: e.target.value })}
                      className="px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={editedData.address.postal_code || ''}
                      onChange={(e) => handleEdit('address', { ...editedData.address, postal_code: e.target.value })}
                      className="px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setStep('upload')}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-[#0f1419] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account with Identity Verification</h2>
            <p className="text-slate-400">
              Upload your identity document to get started. We use AI to securely extract your information.
            </p>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">Document Type</label>
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
                    className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      documentType === type.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-700 bg-[#0f1419] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">Upload Document</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-6 py-8 border-2 border-dashed border-slate-700 rounded-lg hover:border-blue-500 transition-colors group"
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <p className="text-slate-400 text-sm">Click to change document</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-slate-600 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
                    <p className="text-slate-400 font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-slate-500 text-sm">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Test Mode Active</p>
                  <p className="text-blue-400">
                    This is a sandbox environment. No real data is processed. The AI will generate sample extracted data for testing.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!imageFile || !email || processing}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
