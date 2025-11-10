import React, { useState, useEffect } from 'react';
import { ThemedIdentityVerification } from './ThemedIdentityVerification';
import { PaymentSetup } from './PaymentSetup';
import { themeService } from '../services/themeService';

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'identity' | 'payment' | 'complete'>('identity');
  const [userAccountId, setUserAccountId] = useState<string>('');

  useEffect(() => {
    themeService.initializeTheme();
  }, []);

  const handleIdentityComplete = (accountId: string) => {
    setUserAccountId(accountId);
    setStep('payment');
  };

  const handlePaymentComplete = () => {
    setStep('complete');
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  if (step === 'identity') {
    return <ThemedIdentityVerification onComplete={handleIdentityComplete} />;
  }

  if (step === 'payment') {
    return <PaymentSetup userAccountId={userAccountId} onComplete={handlePaymentComplete} />;
  }

  return null;
}
