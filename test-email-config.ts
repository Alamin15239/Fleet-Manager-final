import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

async function testEmailConfig() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n')

  // Check environment variables
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  }

  console.log('📧 Configuration:')
  console.log(`   Host: ${config.host}`)
  console.log(`   Port: ${config.port}`)
  console.log(`   Secure: ${config.secure}`)
  console.log(`   User: ${config.auth.user || 'NOT SET'}`)
  console.log(`   Password: ${config.auth.pass ? '***SET***' : 'NOT SET'}\n`)

  // Validate configuration
  if (!config.auth.user || !config.auth.pass) {
    console.log('❌ Error: EMAIL_USER and EMAIL_PASS must be set in .env file')
    console.log('📋 Please update your .env file with your Gmail SMTP settings:')
    console.log('   EMAIL_USER=your-gmail@gmail.com')
    console.log('   EMAIL_PASS=your-16-character-app-password')
    process.exit(1)
  }

  // Create transporter
  const transporter = nodemailer.createTransport(config)

  try {
    // Test connection
    console.log('🔍 Testing SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection successful!\n')

    // Test email sending
    console.log('📤 Sending test email...')
    
    const mailOptions = {
      from: `"Fleet Manager Test" <${config.auth.user}>`,
      to: config.auth.user, // Send to yourself for testing
      subject: '🧪 Fleet Manager - Email Configuration Test',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Test</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center;">🚛 Fleet Manager</h1>
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #2e7d32; margin-top: 0;">✅ Email Configuration Test Successful!</h2>
              <p style="color: #333;">Your Gmail SMTP configuration is working correctly.</p>
            </div>
            <div style="background-color: #f0f7ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1565c0; margin-top: 0;">Configuration Details:</h3>
              <ul style="color: #333; padding-left: 20px;">
                <li>Host: ${config.host}</li>
                <li>Port: ${config.port}</li>
                <li>Secure: ${config.secure}</li>
                <li>User: ${config.auth.user}</li>
              </ul>
            </div>
            <p style="color: #666; text-align: center; font-size: 14px; margin-top: 30px;">
              This email confirms that your Fleet Manager application can send emails using Gmail SMTP.
            </p>
          </div>
        </body>
        </html>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully!')
    console.log(`   Message ID: ${result.messageId}`)
    console.log(`   Response: ${result.response}`)
    
    console.log('\n🎉 Your Gmail SMTP configuration is working perfectly!')
    console.log('📧 Check your inbox for the test email.')
    
  } catch (error) {
    console.error('❌ Email configuration test failed:')
    console.error('   Error:', error.message)
    
    console.log('\n🔧 Troubleshooting steps:')
    console.log('1. Ensure 2-Step Verification is enabled on your Gmail account')
    console.log('2. Generate a new App Password from: https://myaccount.google.com/apppasswords')
    console.log('3. Use the 16-character App Password (NOT your regular password)')
    console.log('4. Check that EMAIL_SECURE is set to "false"')
    console.log('5. Verify EMAIL_PORT is set to "587"')
    
    if (error.message.includes('Username and Password not accepted')) {
      console.log('\n💡 This error usually means:')
      console.log('   - 2-Step Verification is not enabled')
      console.log('   - You\'re using your regular password instead of App Password')
      console.log('   - The App Password is incorrect or expired')
    }
    
    if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 This error usually means:')
      console.log('   - Network connectivity issues')
      console.log('   - Firewall blocking SMTP port 587')
      console.log('   - Incorrect SMTP server settings')
    }
    
    process.exit(1)
  }
}

// Run the test
testEmailConfig().catch(console.error)