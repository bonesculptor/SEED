/*
  # Identity Verification and Payment System

  1. New Tables
    - `user_accounts`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `date_of_birth` (date)
      - `nationality` (text)
      - `document_type` (text) - passport, drivers_license, visa
      - `document_number` (text)
      - `document_expiry` (date)
      - `address` (jsonb)
      - `phone` (text)
      - `verification_status` (text) - pending, verified, rejected
      - `verification_method` (text) - llm_extracted, manual
      - `account_tier` (text) - free, basic, premium, enterprise
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `identity_documents`
      - `id` (uuid, primary key)
      - `user_account_id` (uuid, foreign key)
      - `document_type` (text)
      - `document_url` (text) - secure storage URL
      - `extracted_data` (jsonb) - LLM extracted information
      - `verification_notes` (text)
      - `uploaded_at` (timestamp)
    
    - `payment_methods`
      - `id` (uuid, primary key)
      - `user_account_id` (uuid, foreign key)
      - `stripe_customer_id` (text)
      - `stripe_payment_method_id` (text)
      - `payment_type` (text) - card, link, bank_transfer
      - `last_four` (text)
      - `card_brand` (text)
      - `is_default` (boolean)
      - `created_at` (timestamp)
    
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_account_id` (uuid, foreign key)
      - `stripe_subscription_id` (text)
      - `plan_tier` (text)
      - `status` (text) - active, cancelled, past_due
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `cancel_at_period_end` (boolean)
      - `created_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_account_id` (uuid, foreign key)
      - `stripe_payment_intent_id` (text)
      - `amount` (integer) - in cents
      - `currency` (text)
      - `status` (text)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access to own data
    - Add admin policies for account management
*/

-- User Accounts Table
CREATE TABLE IF NOT EXISTS user_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  date_of_birth date,
  nationality text,
  document_type text CHECK (document_type IN ('passport', 'drivers_license', 'visa', 'national_id')),
  document_number text,
  document_expiry date,
  address jsonb DEFAULT '{}'::jsonb,
  phone text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
  verification_method text CHECK (verification_method IN ('llm_extracted', 'manual', 'hybrid')),
  account_tier text DEFAULT 'free' CHECK (account_tier IN ('free', 'basic', 'premium', 'enterprise')),
  is_admin boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Identity Documents Table
CREATE TABLE IF NOT EXISTS identity_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id uuid REFERENCES user_accounts(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_url text NOT NULL,
  extracted_data jsonb DEFAULT '{}'::jsonb,
  verification_notes text,
  extraction_confidence decimal(3,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'rejected')),
  uploaded_at timestamptz DEFAULT now()
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id uuid REFERENCES user_accounts(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_payment_method_id text,
  payment_type text CHECK (payment_type IN ('card', 'link', 'bank_transfer', 'other')),
  last_four text,
  card_brand text,
  expiry_month integer,
  expiry_year integer,
  is_default boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id uuid REFERENCES user_accounts(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  plan_tier text NOT NULL CHECK (plan_tier IN ('free', 'basic', 'premium', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  trial_end timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id uuid REFERENCES user_accounts(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  amount integer NOT NULL,
  currency text DEFAULT 'usd',
  status text CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_accounts

-- Users can view their own account
CREATE POLICY "Users can view own account"
  ON user_accounts
  FOR SELECT
  TO authenticated
  USING (email = current_user);

-- Users can update their own account
CREATE POLICY "Users can update own account"
  ON user_accounts
  FOR UPDATE
  TO authenticated
  USING (email = current_user)
  WITH CHECK (email = current_user);

-- Admins can view all accounts
CREATE POLICY "Admins can view all accounts"
  ON user_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE email = current_user AND is_admin = true
    )
  );

-- Admins can update all accounts
CREATE POLICY "Admins can update all accounts"
  ON user_accounts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE email = current_user AND is_admin = true
    )
  );

-- Allow account creation
CREATE POLICY "Anyone can create account"
  ON user_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for identity_documents

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON identity_documents
  FOR SELECT
  TO authenticated
  USING (
    user_account_id IN (
      SELECT id FROM user_accounts WHERE email = current_user
    )
  );

-- Users can insert their own documents
CREATE POLICY "Users can upload own documents"
  ON identity_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_account_id IN (
      SELECT id FROM user_accounts WHERE email = current_user
    )
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON identity_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE email = current_user AND is_admin = true
    )
  );

-- Admins can update documents
CREATE POLICY "Admins can update documents"
  ON identity_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE email = current_user AND is_admin = true
    )
  );

-- RLS Policies for payment_methods

-- Users can view their own payment methods
CREATE POLICY "Users can view own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (
    user_account_id IN (
      SELECT id FROM user_accounts WHERE email = current_user
    )
  );

-- Users can manage their own payment methods
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (
    user_account_id IN (
      SELECT id FROM user_accounts WHERE email = current_user
    )
  )
  WITH CHECK (
    user_account_id IN (
      SELECT id FROM user_accounts WHERE email = current_user
    )
  );

-- RLS Policies for subscriptions

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    user_account_id IN (
      SELECT id FROM user_accounts WHERE email = current_user
    )
  );

-- System can manage subscriptions
CREATE POLICY "System can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for transactions

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    user_account_id IN (
      SELECT id FROM user_accounts WHERE email = current_user
    )
  );

-- System can insert transactions
CREATE POLICY "System can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE email = current_user AND is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_verification_status ON user_accounts(verification_status);
CREATE INDEX IF NOT EXISTS idx_identity_documents_user ON identity_documents(user_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
