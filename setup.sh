#!/bin/bash

# Fleet Manager Setup Script
# Run this script after extracting the project files

echo "🚀 Setting up Fleet Manager Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Generate Prisma client
echo "🗄️ Setting up database..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Database setup completed"

# Push database schema
echo "📊 Creating database..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to create database"
    exit 1
fi

echo "✅ Database created successfully"

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded successfully"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment variables in .env file"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔑 Default admin credentials:"
echo "Email: alamin.kha.saadfreeh@gmail.com"
echo "Password: oOck7534#@"
echo ""
echo "📧 Email Verification System:"
echo "- New users must verify their email address"
echo "- Check console for verification links (development mode)"
echo "- Users must be approved by admin before accessing the system"
echo ""
echo "📚 For deployment instructions, see DEPLOYMENT_SUMMARY.md"