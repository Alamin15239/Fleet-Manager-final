# Production Email Verification Setup Guide

## Table of Contents
1. [Choosing an Email Service Provider](#choosing-an-email-service-provider)
2. [Step-by-Step Setup Guides](#step-by-step-setup-guides)
3. [Environment Configuration](#environment-configuration)
4. [Testing Email Configuration](#testing-email-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

## Choosing an Email Service Provider

### 🏆 **SendGrid (Recommended)**
- **Best for**: Production applications, reliable delivery
- **Pros**: Excellent deliverability, good analytics, easy setup
- **Cons**: Paid after 100 emails/day
- **Setup**: Easy

### 💰 **AWS SES (Most Cost-Effective)**
- **Best for**: High-volume applications, cost-sensitive projects
- **Pros**: Very cheap ($0.10 per 1000 emails), scalable
- **Cons**: Complex setup, requires AWS knowledge
- **Setup**: Moderate

### 🚀 **Resend (Simple & Modern)**
- **Best for**: Developers who want simplicity
- **Pros**: Very easy setup, modern API, generous free tier
- **Cons**: Newer service, fewer features
- **Setup**: Very Easy

### 📧 **Mailgun (Developer-Friendly)**
- **Best for**: Developers, testing environments
- **Pros**: Good documentation, flexible routing
- **Cons**: More expensive than competitors
- **Setup**: Easy

### 🔧 **SMTP (Traditional)**
- **Best for**: Small applications, existing email accounts
- **Pros**: No additional services needed, familiar
- **Cons**: Lower deliverability, spam folder issues
- **Setup**: Easy but requires email provider configuration

## Step-by-Step Setup Guides

### 1. SendGrid Setup

#### Step 1: Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com/) and sign up
2. Verify your email address
3. Complete the account setup

#### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Give it a name (e.g., "Fleet Manager Production")
4. Select "Full Access" or "Restricted Access" with email permissions
5. Copy the API key

#### Step 3: Verify Sender Identity
1. Go to Settings → Sender Authentication
2. Choose either:
   - **Domain Authentication** (recommended for production)
   - **Single Sender Verification** (easier for testing)
3. Follow the verification process

#### Step 4: Install Dependencies
```bash
npm install @sendgrid/mail
```

#### Step 5: Configure Environment
```bash
# .env.production
EMAIL_SERVICE="sendgrid"
SENDGRID_API_KEY="SG.your-api-key-here"
EMAIL_FROM="noreply@yourcompany.com"
```

### 2. AWS SES Setup

#### Step 1: Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Create an account or sign in

#### Step 2: Access SES
1. Search for "Simple Email Service" in services
2. Go to SES dashboard

#### Step 3: Verify Identity
1. Go to "Verified identities"
2. Click "Create identity"
3. Choose email address or domain
4. Follow verification process

#### Step 4: Get Credentials
1. Go to IAM → Users
2. Create new user or use existing
3. Attach "AmazonSESFullAccess" policy
4. Create access keys
5. Copy Access Key ID and Secret Access Key

#### Step 5: Install Dependencies
```bash
npm install @aws-sdk/client-ses
```

#### Step 6: Configure Environment
```bash
# .env.production
EMAIL_SERVICE="aws_ses"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
EMAIL_FROM="noreply@yourcompany.com"
```

### 3. Resend Setup

#### Step 1: Create Resend Account
1. Go to [Resend](https://resend.com/) and sign up
2. Verify your email address

#### Step 2: Get API Key
1. Go to API Keys section
2. Click "Create API Key"
3. Copy the API key

#### Step 3: Verify Domain
1. Go to Domains section
2. Add your domain
3. Follow DNS verification steps

#### Step 4: Install Dependencies
```bash
npm install resend
```

#### Step 5: Configure Environment
```bash
# .env.production
EMAIL_SERVICE="resend"
RESEND_API_KEY="re_your-api-key-here"
EMAIL_FROM="noreply@yourdomain.com"
```

### 4. Mailgun Setup

#### Step 1: Create Mailgun Account
1. Go to [Mailgun](https://www.mailgun.com/) and sign up
2. Verify your email address

#### Step 2: Verify Domain
1. Go to Domains section
2. Add your domain
3. Follow DNS verification steps
4. Note your SMTP credentials and API key

#### Step 3: Install Dependencies
```bash
npm install mailgun.js
```

#### Step 4: Configure Environment
```bash
# .env.production
EMAIL_SERVICE="mailgun"
MAILGUN_API_KEY="your-api-key"
MAILGUN_DOMAIN="your-domain.com"
EMAIL_FROM="noreply@yourdomain.com"
```

### 5. SMTP Setup (Gmail Example)

#### Step 1: Enable 2FA
1. Go to your Google Account
2. Security → 2-Step Verification
3. Enable 2FA

#### Step 2: Create App Password
1. Go to Security → App Passwords
2. Generate new app password
3. Select "Mail" and your device
4. Copy the 16-character password

#### Step 3: Configure Environment
```bash
# .env.production
EMAIL_SERVICE="smtp"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-16-character-app-password"
EMAIL_FROM="your-email@gmail.com"
```

## Environment Configuration

### Production Environment (.env.production)
```bash
# Database
DATABASE_URL="file:./prod.db"

# Email Configuration (choose ONE provider)
EMAIL_SERVICE="sendgrid"  # or "aws_ses", "mailgun", "resend", "smtp"
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourcompany.com"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-change-this-in-production"

# Application Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"
```

### Development Environment (.env.development)
```bash
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration (for testing - logs to console)
EMAIL_SERVICE="development"

# JWT Configuration
JWT_SECRET="your-dev-jwt-secret"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Testing Email Configuration

### 1. Test Email Service
Create a test script to verify your email configuration:

```javascript
// test-email.js
const { emailVerificationService } = require('./src/lib/email-verification.ts');

async function testEmail() {
  try {
    // Test OTP email
    await emailVerificationService.sendOTPEmail(
      'test@example.com',
      '123456',
      'Test User'
    );
    console.log('✅ OTP email test successful');

    // Test verification email
    await emailVerificationService.sendVerificationEmail(
      'test@example.com',
      'test-token-123',
      'Test User'
    );
    console.log('✅ Verification email test successful');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEmail();
```

### 2. Test with curl
```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123","name":"Test User"}'

# Check console for email logs (development mode)
```

## Troubleshooting

### Common Issues

#### 1. **Email Not Sending**
- **Check**: Environment variables are set correctly
- **Check**: API keys are valid and not expired
- **Check**: Sender identity is verified
- **Check**: Network connectivity

#### 2. **Spam Folder Issues**
- **Solution**: Use domain authentication instead of single sender
- **Solution**: Set up SPF, DKIM, and DMARC records
- **Solution**: Use a dedicated email service provider

#### 3. **Rate Limiting**
- **SendGrid**: 100 emails/day free tier
- **AWS SES**: Starts in sandbox mode (need to request production access)
- **Resend**: 3000 emails/month free tier
- **Mailgun**: 5000 emails/month free trial

#### 4. **DNS Configuration Issues**
For domain-based sending, ensure these DNS records are set:

```
# SPF Record
your-domain.com. IN TXT "v=spf1 include:spf.sendgrid.net ~all"

# DKIM Record (provided by email service)
k1._domainkey.your-domain.com. IN CNAME dkim.sendgrid.net

# DMARC Record
_dmarc.your-domain.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@your-domain.com"
```

### Debug Mode

Enable debug logging in development:
```javascript
// In email-verification.ts, add debug mode
constructor() {
  this.emailService = process.env.EMAIL_SERVICE || 'smtp'
  this.debug = process.env.NODE_ENV === 'development'
  
  this.initializeEmailService()
}

// Add debug logging
private async sendViaSendGrid(email: string, subject: string, html: string): Promise<void> {
  if (this.debug) {
    console.log('📧 [DEBUG] SendGrid Email:', { email, subject, htmlLength: html.length })
  }
  // ... rest of the method
}
```

## Best Practices

### 1. **Security**
- 🔒 Use environment variables for all sensitive data
- 🔒 Rotate API keys regularly
- 🔒 Use domain-based authentication
- 🔒 Monitor email sending logs

### 2. **Deliverability**
- 📈 Monitor bounce rates and spam complaints
- 📈 Use double opt-in for user registration
- 📈 Keep email lists clean
- 📈 Use dedicated IP addresses for high volume

### 3. **Performance**
- ⚡ Use email queuing for high volume
- ⚡ Implement retry logic for failed sends
- ⚡ Use connection pooling for SMTP
- ⚡ Monitor email sending performance

### 4. **Compliance**
- 📋 Include unsubscribe links in marketing emails
- 📋 Follow GDPR and CAN-SPAM regulations
- 📋 Keep records of user consent
- 📋 Honor unsubscribe requests promptly

### 5. **Monitoring**
- 📊 Set up email delivery monitoring
- 📊 Track open rates and click-through rates
- 📊 Monitor bounce and complaint rates
- 📊 Set up alerts for delivery issues

## Deployment Checklist

- [ ] Choose and configure email service provider
- [ ] Set up environment variables
- [ ] Install required dependencies
- [ ] Verify sender identity/domain
- [ ] Test email sending in development
- [ ] Configure DNS records (if using custom domain)
- [ ] Set up monitoring and alerts
- [ ] Test with real email addresses
- [ ] Verify spam folder placement
- [ ] Set up email analytics
- [ ] Document email configuration
- [ ] Backup email templates and configuration

## Support

If you encounter issues with email setup:

1. **SendGrid**: [SendGrid Documentation](https://docs.sendgrid.com/)
2. **AWS SES**: [SES Documentation](https://docs.aws.amazon.com/ses/)
3. **Resend**: [Resend Documentation](https://resend.com/docs)
4. **Mailgun**: [Mailgun Documentation](https://documentation.mailgun.com/)
5. **General Issues**: Check the application logs and email service dashboard