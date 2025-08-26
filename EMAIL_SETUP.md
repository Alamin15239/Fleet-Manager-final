# Email Verification Setup for Production

This guide explains how to configure email verification for the Fleet Maintenance Management System in production.

## Prerequisites

1. A domain name (e.g., yourcompany.com)
2. An email service provider (choose one of the options below)
3. Access to your DNS settings

## Email Service Options

### Option 1: Gmail (Recommended for Small Teams)

**Step 1: Enable 2-Factor Authentication**
- Go to your Google Account settings
- Enable 2-Factor Authentication

**Step 2: Create App Password**
- Go to Security → App Passwords
- Generate a new app password for "Fleet Manager"
- Use this password in your environment variables

**Step 3: Environment Variables**
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
EMAIL_FROM=noreply@yourcompany.com
```

### Option 2: SendGrid (Recommended for Production)

**Step 1: Create SendGrid Account**
- Sign up at [SendGrid.com](https://sendgrid.com)
- Verify your domain

**Step 2: Create API Key**
- Go to Settings → API Keys
- Create a new API key with "Full Access" permissions
- Copy the API key

**Step 3: Environment Variables**
```env
# Email Configuration
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourcompany.com
```

### Option 3: AWS SES (Recommended for Enterprise)

**Step 1: Set up AWS SES**
- Go to AWS Console → Simple Email Service
- Verify your domain and/or email addresses
- Request production access (if needed)

**Step 2: Create SMTP Credentials**
- Go to SMTP Settings → Create SMTP Credentials
- Save the credentials securely

**Step 3: Environment Variables**
```env
# Email Configuration
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-smtp-username
EMAIL_PASS=your-smtp-password
EMAIL_FROM=noreply@yourcompany.com
```

### Option 4: Mailgun (Alternative)

**Step 1: Create Mailgun Account**
- Sign up at [Mailgun.com](https://mailgun.com)
- Add and verify your domain

**Step 2: Get SMTP Credentials**
- Go to Domain Settings → SMTP Credentials
- Note the SMTP username and password

**Step 3: Environment Variables**
```env
# Email Configuration
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASS=your-mailgun-password
EMAIL_FROM=noreply@yourdomain.com
```

## DNS Configuration

Regardless of which email service you choose, you may need to configure DNS records:

### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

### DKIM Record (Follow provider instructions)
- Each provider has specific DKIM setup instructions
- This helps with email deliverability

### DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

## Production Email Service Configuration

To enable actual email sending in production, modify the email verification service:

1. **Edit `/src/lib/email-verification.ts`**
2. **Uncomment the email sending code** in both `sendOTPEmail` and `sendVerificationEmail` methods
3. **Remove the development mode logging**

Example changes:

```typescript
// In sendOTPEmail method, replace:
console.log(`\n\n=== DEVELOPMENT MODE ===`)
console.log(`OTP for ${email}: ${otp}`)
console.log(`Name: ${name || 'N/A'}`)
console.log(`===================\n\n`)

// With:
const mailOptions = {
  from: process.env.EMAIL_FROM || 'noreply@fleetmanager.com',
  to: email,
  subject: 'Your OTP for Fleet Manager Login',
  html: `...email template here...`
}

await this.transporter.sendMail(mailOptions)
```

## Testing Email Configuration

### Test SMTP Connection
```bash
# Install telnet if needed
sudo apt-get install telnet

# Test SMTP connection
telnet smtp.gmail.com 587
```

### Test Email Sending
Create a test script to verify email sending works:

```javascript
// test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email'
}).then(info => {
  console.log('Email sent:', info);
}).catch(error => {
  console.error('Error:', error);
});
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check email/password combination
   - For Gmail, ensure you're using an app password
   - Verify 2FA is enabled

2. **Connection Refused**
   - Check firewall settings
   - Verify port number (587 for TLS, 465 for SSL)
   - Check if IP is blocked

3. **Emails Going to Spam**
   - Configure SPF/DKIM/DMARC records
   - Use a dedicated domain for sending emails
   - Ensure email content is not spam-like

4. **Rate Limiting**
   - Gmail: 100 emails/day for free accounts, 2000/day for GSuite
   - SendGrid: 100 emails/day free, then paid plans
   - AWS SES: 62,000 emails/month free tier

### Monitoring

Set up email monitoring:

1. **Bounce Handling**
   - Configure bounce webhooks in your email service
   - Update user email status in database

2. **Delivery Tracking**
   - Use email service analytics
   - Monitor open rates and click-through rates

3. **Error Logging**
   - Log email sending errors
   - Set up alerts for failed deliveries

## Security Best Practices

1. **Environment Variables**
   - Never commit email credentials to version control
   - Use secure storage for secrets (AWS Secrets Manager, etc.)

2. **Email Templates**
   - Use consistent branding
   - Include unsubscribe links
   - Follow CAN-SPAM compliance

3. **Rate Limiting**
   - Implement client-side rate limiting
   - Respect email service provider limits

4. **Verification Tokens**
   - Use secure random generation
   - Set appropriate expiration times (24 hours for email verification)
   - Invalidate tokens after use

## Production Deployment Checklist

- [ ] Choose and configure email service provider
- [ ] Set up DNS records (SPF, DKIM, DMARC)
- [ ] Configure environment variables
- [ ] Uncomment production email code
- [ ] Test email sending with test accounts
- [ ] Verify email templates look correct
- [ ] Set up email monitoring and logging
- [ ] Configure bounce handling
- [ ] Test email verification flow end-to-end
- [ ] Test OTP login flow end-to-end

## Support

If you encounter issues with email configuration:

1. Check your email service provider's documentation
2. Verify DNS records using tools like MXToolbox
3. Test SMTP connectivity using telnet or openssl
4. Check server logs for error messages
5. Ensure your server IP is not on blacklists