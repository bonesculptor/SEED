import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Loader, AlertCircle, Shield, Zap } from 'lucide-react';
import { stripeService, SubscriptionPlan } from '../services/stripeService';

export function PaymentSetup({ userAccountId, onComplete }: { userAccountId: string; onComplete: () => void }) {
  const [step, setStep] = useState<'plan' | 'payment' | 'processing' | 'complete'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentType, setPaymentType] = useState<'card' | 'link'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPlans(stripeService.getPlans());
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    if (plan.tier === 'free') {
      handleFreePlan();
    } else {
      setStep('payment');
    }
  };

  const handleFreePlan = async () => {
    setProcessing(true);
    try {
      await stripeService.createSubscription(userAccountId, 'free');
      setStep('complete');
      setTimeout(() => onComplete(), 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    if (paymentType === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
        setError('Please fill in all card details');
        return;
      }
    }

    setProcessing(true);
    setError('');
    setStep('processing');

    try {
      // Create payment method
      await stripeService.createPaymentMethod({
        user_account_id: userAccountId,
        payment_type: paymentType
      });

      // Create subscription
      await stripeService.createSubscription(userAccountId, selectedPlan.tier);

      setStep('complete');
      setTimeout(() => onComplete(), 2000);
    } catch (err) {
      setError((err as Error).message);
      setStep('payment');
    } finally {
      setProcessing(false);
    }
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Loader className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
          <p className="text-slate-400">Please wait while we set up your subscription...</p>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">All Set!</h2>
          <p className="text-slate-400 mb-6">
            Your {selectedPlan?.name} plan has been activated successfully.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-[#0f1419] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-2">Payment Method</h2>
              <p className="text-slate-400">
                Choose how you'd like to pay for your {selectedPlan?.name} subscription
              </p>
              <div className="mt-4 flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div>
                  <p className="text-white font-medium">{selectedPlan?.name} Plan</p>
                  <p className="text-slate-400 text-sm">
                    {stripeService.formatPrice(selectedPlan?.price || 0)}/{selectedPlan?.interval}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Payment Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentType('card')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      paymentType === 'card'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-700 bg-[#0f1419] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentType('link')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      paymentType === 'link'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-700 bg-[#0f1419] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    <span className="font-medium">Link</span>
                  </button>
                </div>
              </div>

              {paymentType === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm font-medium mb-2">Test Mode - Use Test Cards:</p>
                    {stripeService.getTestCards().map((card, i) => (
                      <p key={i} className="text-yellow-300 text-xs font-mono">{card.number} - {card.type}</p>
                    ))}
                  </div>
                </div>
              )}

              {paymentType === 'link' && (
                <div className="mb-6 p-6 bg-[#0f1419] border border-slate-700 rounded-lg text-center">
                  <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">Pay with Link</p>
                  <p className="text-slate-400 text-sm">
                    Link will securely save your payment info for faster checkouts
                  </p>
                </div>
              )}

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-slate-300 font-medium mb-1">Secure Payment</p>
                  <p className="text-slate-400">
                    Your payment information is encrypted and secure. This is a test environment - no real charges will be made.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('plan')}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Complete Payment
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h2>
          <p className="text-slate-400 text-lg">
            Select the plan that best fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`bg-[#1a1f2e] border rounded-2xl overflow-hidden transition-all ${
                plan.tier === 'premium'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-6 border-b border-slate-800">
                {plan.tier === 'premium' && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">
                    {stripeService.formatPrice(plan.price).split('.')[0]}
                  </span>
                  <span className="text-slate-400">/{plan.interval}</span>
                </div>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={processing}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    plan.tier === 'premium'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {plan.tier === 'free' ? 'Get Started' : 'Choose Plan'}
                </button>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onComplete}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
