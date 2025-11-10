import { supabase } from '../lib/supabase';

export interface PaymentMethod {
  id?: string;
  user_account_id: string;
  stripe_customer_id?: string;
  stripe_payment_method_id?: string;
  payment_type: 'card' | 'link' | 'bank_transfer';
  last_four?: string;
  card_brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default?: boolean;
}

export interface SubscriptionPlan {
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export class StripeService {
  private isTestMode = true; // Sandbox mode

  getPublishableKey(): string {
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_sandbox';
  }

  getPlans(): SubscriptionPlan[] {
    return [
      {
        tier: 'free',
        name: 'Free',
        price: 0,
        currency: 'usd',
        interval: 'month',
        features: [
          'Basic protocol creation',
          '5 projects',
          'Community support',
          'Single user'
        ]
      },
      {
        tier: 'basic',
        name: 'Basic',
        price: 29,
        currency: 'usd',
        interval: 'month',
        features: [
          'All Free features',
          'Unlimited projects',
          'Email support',
          'Up to 5 team members',
          'Workflow templates'
        ]
      },
      {
        tier: 'premium',
        name: 'Premium',
        price: 99,
        currency: 'usd',
        interval: 'month',
        features: [
          'All Basic features',
          'Priority support',
          'Unlimited team members',
          'Advanced analytics',
          'Custom integrations',
          'API access'
        ]
      },
      {
        tier: 'enterprise',
        name: 'Enterprise',
        price: 499,
        currency: 'usd',
        interval: 'month',
        features: [
          'All Premium features',
          'Dedicated support',
          'Custom deployment',
          'SLA guarantee',
          'Advanced security',
          'Training & onboarding'
        ]
      }
    ];
  }

  async createPaymentMethod(paymentMethodData: PaymentMethod): Promise<any> {
    // In test mode, create mock payment method
    if (this.isTestMode) {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_account_id: paymentMethodData.user_account_id,
          stripe_customer_id: 'cus_test_' + Date.now(),
          stripe_payment_method_id: 'pm_test_' + Date.now(),
          payment_type: paymentMethodData.payment_type,
          last_four: '4242',
          card_brand: 'visa',
          expiry_month: 12,
          expiry_year: 2030,
          is_default: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // In production, this would call Stripe API
    throw new Error('Production Stripe integration not configured');
  }

  async getPaymentMethods(userAccountId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_account_id', userAccountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId);

    if (error) throw error;
  }

  async createSubscription(userAccountId: string, planTier: string): Promise<any> {
    const plan = this.getPlans().find(p => p.tier === planTier);
    if (!plan) throw new Error('Invalid plan tier');

    // In test mode, create mock subscription
    if (this.isTestMode) {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_account_id: userAccountId,
          stripe_subscription_id: 'sub_test_' + Date.now(),
          plan_tier: planTier,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update user account tier
      await supabase
        .from('user_accounts')
        .update({ account_tier: planTier })
        .eq('id', userAccountId);

      // Create transaction record
      if (plan.price > 0) {
        await this.createTransaction({
          user_account_id: userAccountId,
          amount: plan.price * 100, // cents
          currency: plan.currency,
          status: 'succeeded',
          description: `${plan.name} subscription - ${plan.interval}ly`
        });
      }

      return data;
    }

    throw new Error('Production Stripe integration not configured');
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserSubscription(userAccountId: string): Promise<any> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_account_id', userAccountId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createTransaction(transactionData: {
    user_account_id: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        stripe_payment_intent_id: 'pi_test_' + Date.now()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserTransactions(userAccountId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_account_id', userAccountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  formatPrice(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  getTestCards() {
    return [
      { number: '4242 4242 4242 4242', type: 'Visa - Success' },
      { number: '4000 0025 0000 3155', type: 'Visa - 3D Secure' },
      { number: '5555 5555 5555 4444', type: 'Mastercard - Success' }
    ];
  }
}

export const stripeService = new StripeService();
