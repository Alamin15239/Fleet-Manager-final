# Email Verification and OTP System

This document describes the complete email verification and OTP-based authentication system implemented for the Fleet Maintenance Management System.

## Overview

The system implements a secure two-factor authentication flow that ensures users must verify their real email addresses and use OTP for login access. This prevents fake email registrations and enhances security.

## Features

### 1. Email Verification
- **Automatic Verification Email**: Users receive a verification email upon registration
- **Secure Token Generation**: Uses cryptographically secure tokens with 24-hour expiry
- **Verification Page**: Dedicated page for email token verification
- **Database Integration**: Tracks verification status in the database

### 2. OTP-Based Login
- **Dual Login Methods**: Users can choose between password and OTP login
- **Secure OTP Generation**: 6-digit OTPs with 10-minute expiry
- **Rate Limiting**: 60-second cooldown between OTP requests
- **Email Delivery**: Professional HTML email templates for OTP delivery

### 3. Security Features
- **OTP Hashing**: OTPs are hashed using SHA-256 before storage
- **Token Expiry**: Both verification tokens and OTPs have automatic expiry
- **Rate Limiting**: Prevents OTP spam with cooldown periods
- **Admin Approval**: Requires admin approval even after email verification

## User Flow

### Registration Process
1. **User Registration** → Create account with email, password, and name
2. **Email Verification** → Automatic verification email sent to user's email
3. **Email Verification Page** → User clicks verification link or enters token manually
4. **Admin Approval** → Admin must approve user account in admin panel
5. **Full Access** → User can now access the system with verified email

### Login Process
Users have two login options:

#### Password Login
1. Enter email and password
2. System checks if email is verified
3. System checks if account is approved
4. Successful login

#### OTP Login
1. Enter email address
2. Click "Send OTP" button
3. Receive 6-digit OTP via email
4. Enter OTP in the provided fields
5. System verifies OTP and checks approval status
6. Successful login

## Database Schema Updates

### User Model Enhancements
```sql
-- Email verification fields
isEmailVerified BOOLEAN DEFAULT FALSE
emailVerificationToken STRING?
emailVerificationExpires DATETIME?

-- OTP fields
otpCode STRING?
otpExpires DATETIME?
lastOtpRequest DATETIME?
```

## API Endpoints

### Email Verification
- `POST /api/auth/register` - Creates user and sends verification email
- `POST /api/auth/verify-email` - Verifies email token
- `GET /verify-email` - Email verification page

### OTP Management
- `POST /api/auth/send-otp` - Sends OTP to user's email
- `POST /api/auth/verify-otp` - Verifies OTP and authenticates user

### Enhanced Authentication
- `POST /api/auth/login` - Enhanced to check email verification status

## Email Templates

### Verification Email
- Professional HTML template with company branding
- Clear instructions for email verification
- Security notices and expiration information
- Mobile-responsive design

### OTP Email
- Secure OTP display with proper formatting
- Expiration information (10 minutes)
- Security warnings about OTP sharing
- Company branding and professional design

## Security Considerations

### OTP Security
- **OTP Generation**: Cryptographically secure random 6-digit numbers
- **OTP Storage**: Hashed using SHA-256 before database storage
- **OTP Expiry**: Automatic expiry after 10 minutes
- **Rate Limiting**: 60-second cooldown between requests

### Email Verification Security
- **Token Generation**: 32-byte cryptographically secure random tokens
- **Token Expiry**: 24-hour automatic expiry
- **Unique Tokens**: Each verification token is unique and single-use

### Database Security
- **Hashed Storage**: Sensitive data is hashed before storage
- **Automatic Cleanup**: Expired tokens are automatically invalidated
- **Audit Trail**: All verification attempts are logged

## Configuration

### Environment Variables
```bash
# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@fleetmanager.com"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key"
```

### Email Service Setup
For production deployment, configure:
1. **SMTP Server**: Use a reliable email service (SendGrid, Mailgun, AWS SES)
2. **Domain Verification**: Verify your domain with the email service
3. **SPF/DKIM**: Set up proper DNS records for email deliverability
4. **Templates**: Customize email templates with your company branding

## Implementation Details

### Email Verification Service
The `EmailVerificationService` class provides:
- OTP generation and validation
- Email token management
- Email sending functionality
- Rate limiting and security checks

### Frontend Components
- **Signup Page**: Enhanced with email verification information
- **Login Page**: Dual login methods with OTP support
- **Verification Page**: Dedicated email verification interface
- **OTP Input**: Custom OTP input component with proper formatting

### Error Handling
- Comprehensive error messages for users
- Graceful fallback for email delivery failures
- Proper error logging and monitoring
- User-friendly error recovery options

## Testing

### Manual Testing
1. **Registration Flow**: Test complete registration with email verification
2. **OTP Login**: Test OTP generation and verification
3. **Password Login**: Test enhanced password login with verification checks
4. **Error Cases**: Test invalid tokens, expired OTPs, and rate limiting

### Automated Testing
- Unit tests for email verification service
- Integration tests for API endpoints
- Component tests for frontend forms
- Security tests for OTP and token handling

## Deployment Notes

### Production Setup
1. **Configure Email Service**: Set up production email service credentials
2. **Set Environment Variables**: Configure all required environment variables
3. **Test Email Delivery**: Verify emails are being delivered successfully
4. **Monitor Logs**: Set up monitoring for email delivery and verification failures

### Security Best Practices
1. **Use HTTPS**: Ensure all communications are encrypted
2. **Secure Environment Variables**: Store sensitive credentials securely
3. **Monitor Abuse**: Set up alerts for suspicious OTP request patterns
4. **Regular Updates**: Keep email service dependencies updated

## Troubleshooting

### Common Issues
1. **Email Not Delivered**: Check email service configuration and spam folders
2. **OTP Not Working**: Verify OTP generation and validation logic
3. **Verification Fails**: Check token generation and database storage
4. **Rate Limiting**: Ensure proper cooldown periods are enforced

### Debug Steps
1. Check application logs for error messages
2. Verify email service configuration and credentials
3. Test email delivery manually
4. Check database records for tokens and OTPs
5. Verify frontend form submissions and API calls

## Future Enhancements

### Planned Features
1. **SMS OTP**: Add SMS-based OTP as an alternative
2. **Multi-factor Authentication**: Add additional security layers
3. **Email Templates**: More customizable email templates
4. **Analytics**: Track verification and login success rates

### Security Enhancements
1. **Biometric Authentication**: Add fingerprint/face recognition support
2. **Device Trust**: Implement device-based trust scoring
3. **Anomaly Detection**: AI-powered suspicious activity detection
4. **Session Management**: Enhanced session security features

This comprehensive email verification and OTP system ensures that only legitimate users with verified email addresses can access the Fleet Maintenance Management System, providing both security and user convenience.