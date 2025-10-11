-- Migration: add subscription fields to companies for Stripe
ALTER TABLE companies
  ADD COLUMN stripe_customer_id varchar(255),
  ADD COLUMN stripe_subscription_id varchar(255),
  ADD COLUMN subscription_status varchar(50),
  ADD COLUMN current_period_end timestamp,
  ADD COLUMN last_paid_at timestamp,
  ADD COLUMN stripe_session_id varchar(255);

-- Optional: create indexes for lookups
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer_id ON companies (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_companies_stripe_subscription_id ON companies (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_companies_stripe_session_id ON companies (stripe_session_id);
