# Identity Verification & Payment System with Dynamic GICS Theming

## Overview

The application now features a complete identity verification and payment system with dynamic color theming based on GICS (Global Industry Classification Standard) sectors. The interface automatically adapts its color palette based on the selected industry sector.

## Dynamic Theming System

### GICS Sector Themes

The application supports **11 industry sector themes**, each with unique color palettes:

1. **Energy** - Red tones (`#E53935`)
2. **Materials** - Orange tones (`#FB8C00`)
3. **Industrials** - Yellow tones (`#FDD835`)
4. **Consumer Discretionary** - Green tones (`#43A047`)
5. **Health Care** - Cyan tones (`#00ACC1`)
6. **Financials** - Indigo tones (`#3949AB`)
7. **Information Technology** - Purple tones (`#8E24AA`) - *Default*
8. **Communication Services** - Pink tones (`#EC407A`)
9. **Utilities** - Teal tones (`#00897B`)
10. **Real Estate** - Brown tones (`#6D4C41`)

### Theme Structure

Each sector theme includes:

**Colors:**
- `primary-300/500/700/900` - Primary brand colors
- `surface.bg` - Main background
- `surface.panel` - Card/panel backgrounds
- `surface.elevated` - Elevated surfaces
- `surface.muted` - Muted backgrounds
- `surface.border` - Border colors
- `surface.text` - Primary text
- `surface.text_muted` - Secondary text
- `subsectors.sub10/20/30` - Subsector accent colors
- `status` - Success, warning, danger, info colors
- `metals` - Gold, silver, platinum, copper, bronze

### CSS Variables

The theme system uses CSS custom properties:

```css
:root {
  --color-bg: #120A14;
  --color-panel: #1A1D22;
  --color-elevated: #22262D;
  --color-muted: #2B3038;
  --color-border: #353B45;
  --color-text: #E9EDF1;
  --color-text-muted: #B5BDC9;
  --primary-300: #BB7BCC;
  --primary-500: #8E24AA;
  --primary-700: #5C176E;
  --primary-900: #380E44;
  /* ... more variables */
}
```

## Identity Verification System

### Features

**Document Upload:**
- Support for passport, driver's license, visa, national ID
- Drag-and-drop file upload
- 10MB file size limit
- Image preview
- Validation

**AI-Powered Extraction:**
- Integrates with OpenAI GPT-4 Vision or Claude Vision
- Extracts:
  - Full name
  - Date of birth
  - Nationality
  - Document number
  - Expiry date
  - Address (street, city, state, postal code, country)
- Confidence scoring
- Sandbox mode with mock data

**Review & Correction:**
- User reviews extracted data
- Edit any incorrect fields
- Visual confidence indicators
- Address breakdown

**Account Creation:**
- Automatic account generation
- Secure document storage
- Verification status tracking
- Email and phone capture

### Database Tables

**user_accounts:**
- Full user profile
- Verification status (pending, under_review, verified, rejected)
- Account tier (free, basic, premium, enterprise)
- Document details
- Contact information

**identity_documents:**
- Document storage references
- Extracted data (JSON)
- Verification notes
- Extraction confidence
- Upload timestamp

## Payment & Subscription System

### Subscription Tiers

**Free - $0/month:**
- Basic protocol creation
- 5 projects
- Community support
- Single user

**Basic - $29/month:**
- All Free features
- Unlimited projects
- Email support
- Up to 5 team members
- Workflow templates

**Premium - $99/month (POPULAR):**
- All Basic features
- Priority support
- Unlimited team members
- Advanced analytics
- Custom integrations
- API access

**Enterprise - $499/month:**
- All Premium features
- Dedicated support
- Custom deployment
- SLA guarantee
- Advanced security
- Training & onboarding

### Payment Methods

**Supported:**
- Credit/debit cards
- Stripe Link
- Bank transfer (coming soon)

**Test Mode:**
- Sandbox environment
- Test card numbers provided
- No real charges
- Full payment flow testing

**Test Cards:**
```
4242 4242 4242 4242 - Visa Success
4000 0025 0000 3155 - Visa 3D Secure
5555 5555 5555 4444 - Mastercard Success
```

### Database Tables

**payment_methods:**
- Stripe customer ID
- Payment method ID
- Card details (last 4, brand, expiry)
- Default payment flag

**subscriptions:**
- Subscription ID
- Plan tier
- Status (active, cancelled, past_due)
- Billing periods
- Cancellation settings

**transactions:**
- Payment intent ID
- Amount (in cents)
- Currency
- Status
- Description
- Timestamp

## Admin Account Management

### Dashboard Features

**Statistics Overview:**
- Total accounts
- Verified count
- Pending count
- Rejected count

**Search & Filtering:**
- Search by name, email, document number
- Filter by status
- Real-time results

**Account Management:**
- View all user details
- Document information
- Verification actions:
  - Verify account
  - Mark under review
  - Reject account
- Status tracking

**Security:**
- Admin-only access
- Row Level Security (RLS)
- Audit trails
- Secure document access

## Theme Selector Component

### Usage

The `SectorThemeSelector` component allows users to change the application theme:

**Features:**
- Dropdown selector
- Visual preview of each theme
- Sector icons
- Color swatches
- Persistent storage (localStorage)

**Integration:**
```tsx
import { SectorThemeSelector } from './components/SectorThemeSelector';

<SectorThemeSelector />
```

**Location:**
- Top-right corner of onboarding flow
- Admin dashboard header
- Settings panel

## Services

### ThemeService

**Methods:**
```typescript
themeService.initializeTheme()         // Load saved preference
themeService.setSector(sector)          // Change theme
themeService.getCurrentSector()         // Get current sector
themeService.getSectorTheme(sector)     // Get theme colors
themeService.storeSectorPreference()    // Save preference
```

### IdentityVerificationService

**Methods:**
```typescript
extractDataFromDocument(base64, type)   // AI extraction
createUserAccount(data)                 // Create account
updateUserAccount(id, updates)          // Update account
getUserAccount(email)                   // Get by email
getAllUserAccounts()                    // Admin: get all
uploadIdentityDocument()                // Store document
verifyDocument()                        // Admin: verify
```

### StripeService

**Methods:**
```typescript
getPlans()                              // Get subscription plans
createPaymentMethod()                   // Add payment method
getPaymentMethods(userId)               // Get user's methods
createSubscription(userId, tier)        // Start subscription
cancelSubscription(subId)               // Cancel subscription
getUserTransactions(userId)             // Get payment history
```

## How to Use

### User Flow

1. **Access Settings** → Open Settings panel
2. **Create Account** → Click "Create New Account"
3. **Select Theme** → Choose industry sector (optional)
4. **Upload Document** → Select type and upload image
5. **AI Processing** → Wait for extraction (or use mock data in sandbox)
6. **Review Data** → Verify all extracted fields
7. **Choose Plan** → Select subscription tier
8. **Add Payment** → Enter card details or use Link
9. **Complete** → Account activated!

### Admin Flow

1. **Access Settings** → Click "Manage Accounts (Admin)"
2. **View Dashboard** → See statistics and all accounts
3. **Search/Filter** → Find specific accounts
4. **Select Account** → Click to view details
5. **Take Action** → Verify, review, or reject
6. **Track Changes** → Monitor verification status

## Configuration

### Environment Variables

**Optional (for production):**
```env
VITE_OPENAI_API_KEY=sk-...           # For GPT-4 Vision
VITE_ANTHROPIC_API_KEY=sk-ant-...    # For Claude Vision
VITE_STRIPE_PUBLISHABLE_KEY=pk_...   # For Stripe payments
```

**Note:** Sandbox mode works without API keys using mock data.

### Theme Customization

Themes are defined in:
- `src/gics_dark_tokens_ext.json` - Color definitions
- `src/gics_dark_themes_ext.css` - CSS variables

To add a new sector theme:
1. Add entry to JSON with color scheme
2. Add CSS variables in theme file
3. Update `GICSSector` type in `themeService.ts`

## Security

**Row Level Security (RLS):**
- Users can only access their own data
- Admins have elevated permissions
- Document access restricted
- Payment data encrypted

**Data Protection:**
- Secure document storage
- No plain-text sensitive data
- Audit trails on all changes
- Verification workflows

**Payment Security:**
- PCI-compliant (via Stripe)
- No direct card storage
- Tokenized payments
- Test mode for development

## Architecture

### Component Structure
```
Settings Panel
├── OnboardingFlow
│   ├── ThemedIdentityVerification
│   │   ├── SectorThemeSelector
│   │   ├── Document Upload
│   │   ├── AI Extraction
│   │   └── Data Review
│   └── PaymentSetup
│       ├── Plan Selection
│       ├── Payment Method
│       └── Subscription Creation
└── AdminAccountManager
    ├── SectorThemeSelector
    ├── Statistics Cards
    ├── Search & Filters
    ├── Account List
    └── Detail Panel
```

### Database Schema
```
user_accounts
├── id (uuid)
├── email (unique)
├── full_name
├── date_of_birth
├── nationality
├── document_type
├── document_number
├── document_expiry
├── address (jsonb)
├── phone
├── verification_status
├── account_tier
└── timestamps

identity_documents
├── id (uuid)
├── user_account_id (fk)
├── document_type
├── document_url
├── extracted_data (jsonb)
├── extraction_confidence
├── verification_notes
└── timestamps

payment_methods
├── id (uuid)
├── user_account_id (fk)
├── stripe_customer_id
├── payment_type
├── card details
└── timestamps

subscriptions
├── id (uuid)
├── user_account_id (fk)
├── plan_tier
├── status
├── billing periods
└── timestamps

transactions
├── id (uuid)
├── user_account_id (fk)
├── amount
├── currency
├── status
└── timestamp
```

## Testing

**Sandbox Mode:**
- No real API calls required
- Mock data generation
- Test payment flows
- Full feature testing

**Test Scenarios:**
1. Create account with different document types
2. Test AI extraction with/without API keys
3. Try all subscription tiers
4. Test payment methods
5. Admin verification workflows
6. Theme switching across sectors

## Deployment Checklist

**Before Production:**

- [ ] Configure Supabase database
- [ ] Set up Stripe account and keys
- [ ] Add LLM API keys (OpenAI or Anthropic)
- [ ] Configure Supabase Storage for documents
- [ ] Set up email notifications
- [ ] Enable production Stripe mode
- [ ] Configure domain and CORS
- [ ] Set up backup procedures
- [ ] Test RLS policies
- [ ] Review security settings

## Support

**Common Issues:**

**Theme not changing:**
- Clear localStorage
- Hard refresh browser
- Check CSS import order

**AI extraction not working:**
- Verify API keys in .env
- Check sandbox mode is enabled
- Review API quota/limits

**Payment failing:**
- Confirm test mode is active
- Use provided test cards
- Check Stripe configuration

**Admin panel not accessible:**
- Verify user has is_admin=true
- Check RLS policies
- Review authentication

## Future Enhancements

**Planned Features:**
- Biometric verification
- Multi-factor authentication
- Document expiry alerts
- Bulk import/export
- Advanced analytics dashboard
- Custom branding per sector
- Mobile app integration
- API webhooks
- Advanced reporting
- Compliance certifications
