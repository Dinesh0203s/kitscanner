@echo off
echo ========================================
echo Laptop Inventory Scanner - Setup
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo.
    echo Please create a .env file with your Neon database URL:
    echo DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
    echo.
    echo You can copy .env.example and update it with your credentials.
    echo.
    pause
    exit /b 1
)

echo [1/3] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma Client
    pause
    exit /b 1
)

echo [2/3] Pushing schema to database...
call npx prisma db push
if errorlevel 1 (
    echo [ERROR] Failed to push schema
    echo.
    echo Please check your DATABASE_URL in .env file
    pause
    exit /b 1
)

echo.
echo [3/3] Setup complete!
echo.
echo ========================================
echo Next steps:
echo ========================================
echo 1. Run: npm run dev
echo 2. Open: http://localhost:3000
echo 3. Start scanning laptops!
echo.
echo Optional: Run 'npx prisma studio' to view database
echo ========================================
echo.
pause
