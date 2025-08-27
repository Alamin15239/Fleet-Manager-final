@echo off
REM Fleet Manager Setup Script for Windows
REM Run this script after extracting the project files

echo 🚀 Setting up Fleet Manager Project...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Generate Prisma client
echo 🗄️ Setting up database...
npm run db:generate

if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

echo ✅ Database setup completed

REM Push database schema
echo 📊 Creating database...
npm run db:push

if %errorlevel% neq 0 (
    echo ❌ Failed to create database
    pause
    exit /b 1
)

echo ✅ Database created successfully

REM Seed database
echo 🌱 Seeding database with sample data...
npm run db:seed

if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo ✅ Database seeded successfully

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Configure your environment variables in .env file
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo 🔑 Default admin credentials:
echo Email: alamin.kha.saadfreeh@gmail.com
echo Password: oOck7534#@
echo.
echo 📧 Email Verification System:
echo - New users must verify their email address
echo - Check console for verification links (development mode)
echo - Users must be approved by admin before accessing the system
echo.
echo 📚 For deployment instructions, see DEPLOYMENT_SUMMARY.md
pause