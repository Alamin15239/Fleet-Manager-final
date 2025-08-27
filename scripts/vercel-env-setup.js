#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import crypto from 'crypto'

console.log('🚀 Vercel Deployment Setup Script\n')

// Generate secure JWT secret
const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('base64').slice(0, 32)
}

const jwtSecret = generateJwtSecret()
console.log('✅ Generated JWT Secret')

// Generate secure database password
const generateDbPassword = () => {
  return crypto.randomBytes(16).toString('base64').slice(0, 16)
}

const dbPassword = generateDbPassword()
console.log('✅ Generated Database Password')

// Create environment variables file for Vercel
const envVars = `# Database Configuration
# Replace with your actual database URL from your database provider
# Examples:
# Vercel Postgres: postgresql://user:${dbPassword}@host.vercel-storage.com/dbname?sslmode=require
# Supabase: postgresql://postgres.${dbPassword}@aws-0-us-west-1.pooler.supabase.com:6543/postgres
# Railway: postgresql://postgres:${dbPassword}@containers.railway.app:port/railway
DATABASE_URL="your-database-url-here"

# JWT Configuration
JWT_SECRET="${jwtSecret}"

# Application Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Email Configuration - Choose ONE option:

# Option 1: Gmail (for development/testing)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"
EMAIL_FROM="your-email@gmail.com"

# Option 2: SendGrid (recommended for production)
# SENDGRID_API_KEY="your-sendgrid-api-key"
# EMAIL_FROM="your-verified-sender@domain.com"

# Option 3: Resend (modern email service)
# RESEND_API_KEY="your-resend-api-key"
# EMAIL_FROM="your-verified-sender@domain.com"

# File Upload Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Optional: Analytics
# NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="your-ga-id"
`

// Write to file
writeFileSync('.env.vercel', envVars)
console.log('✅ Created .env.vercel file')

console.log('\n📋 Next Steps for Vercel Deployment:')
console.log('=====================================\n')

console.log('1. Set up a database:')
console.log('   - Vercel Postgres (easiest)')
console.log('   - Supabase (free tier available)')
console.log('   - Railway (good for Node.js apps)')
console.log('   - PlanetScale (MySQL compatible)\n')

console.log('2. Configure email service:')
console.log('   - For testing: Use Gmail with App Password')
console.log('   - For production: Use SendGrid or Resend\n')

console.log('3. Set up Vercel Blob for file uploads:')
console.log('   - Go to Vercel dashboard → Storage')
console.log('   - Create a new Blob store')
console.log('   - Copy the read-write token\n')

console.log('4. Add environment variables to Vercel:')
console.log('   - Go to your Vercel project')
console.log('   - Navigate to Settings → Environment Variables')
console.log('   - Add each variable from .env.vercel')
console.log('   - Make sure to select Production, Preview, and Development environments\n')

console.log('5. Deploy your application:')
console.log('   - Connect your GitHub repository to Vercel')
console.log('   - Or deploy using the Vercel CLI\n')

console.log('6. After deployment, test these endpoints:')
console.log('   - Health check: https://your-app.vercel.app/api/health')
console.log('   - Database test: https://your-app.vercel.app/api/health/db')
console.log('   - Auth test: https://your-app.vercel.app/api/test-auth\n')

console.log('🔧 Common Issues and Fixes:')
console.log('============================\n')

console.log('Database Connection Issues:')
console.log('- Make sure DATABASE_URL is correct')
console.log('- Check if your database allows connections from Vercel')
console.log('- Ensure SSL is enabled for production databases\n')

console.log('Email Issues:')
console.log('- For Gmail: Use App Password, not your regular password')
console.log('- For SendGrid: Verify your sender domain')
console.log('- Check spam folder for test emails\n')

console.log('Build Issues:')
console.log('- Make sure all dependencies are installed')
console.log('- Check for TypeScript errors')
console.log('- Ensure environment variables are set correctly\n')

console.log('✅ Setup complete! Check .env.vercel for your environment variables.')