# Setup Guide - Laptop Inventory Scanner

## Quick Start (5 minutes)

### Step 1: Configure Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Sign up or log in
3. Click "Create Project"
4. Copy your connection string (looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb`)

### Step 2: Create Environment File

Create a `.env` file in the `laptop-inventory` folder:

```bash
DATABASE_URL="postgresql://your-connection-string-here?sslmode=require"
```

**Important**: Make sure to add `?sslmode=require` at the end of your connection string!

### Step 3: Initialize Database

Run these commands in the `laptop-inventory` folder:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 4: Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Detailed Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Neon account (free tier available)

### Database Setup (Neon)

#### Option 1: Using Neon Console (Recommended)

1. Visit [https://console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Select your region (choose closest to your location)
4. Copy the connection string from the dashboard
5. The format will be: `postgresql://[user]:[password]@[host]/[database]`

#### Option 2: Using Neon CLI

```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Create project
neonctl projects create --name laptop-inventory

# Get connection string
neonctl connection-string
```

### Environment Configuration

Create `.env` file with your Neon connection string:

```env
# Example format
DATABASE_URL="postgresql://alex:AbC123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Security Note**: Never commit `.env` to version control. It's already in `.gitignore`.

### Database Migration

```bash
# Generate Prisma Client (creates type-safe database client)
npx prisma generate

# Create and apply migration (creates tables in database)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### Verify Setup

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. You should be redirected to `/scan`
4. Try entering test data:
   - Serial Number: `TEST001`
   - ELCOT Number: `ELCOT001`
5. Click "View List" to see your entry
6. Try "Download Excel" to test export

---

## Troubleshooting

### "Can't reach database server"

**Problem**: Prisma can't connect to Neon database

**Solutions**:
- Check your `DATABASE_URL` in `.env`
- Ensure `?sslmode=require` is at the end
- Verify your Neon project is active (not suspended)
- Check your internet connection

### "Environment variable not found: DATABASE_URL"

**Problem**: `.env` file not loaded

**Solutions**:
- Ensure `.env` file is in the root of `laptop-inventory` folder
- Restart your development server
- Check file is named exactly `.env` (not `.env.txt`)

### "Prisma Client not generated"

**Problem**: Prisma Client needs to be generated

**Solution**:
```bash
npx prisma generate
```

### Migration Errors

**Problem**: Database schema out of sync

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create fresh migration
npx prisma migrate dev --name init
```

### Port 3000 Already in Use

**Problem**: Another app is using port 3000

**Solution**:
```bash
# Use different port
npm run dev -- -p 3001
```

---

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variable:
   - Key: `DATABASE_URL`
   - Value: Your Neon connection string
6. Click "Deploy"

### Deploy to Other Platforms

For Railway, Render, or other platforms:

1. Ensure `package.json` has correct build script:
```json
"build": "prisma generate && next build"
```

2. Set environment variable `DATABASE_URL`

3. The platform will automatically:
   - Install dependencies
   - Generate Prisma Client
   - Build Next.js app
   - Start production server

---

## Database Management

### View Data (Prisma Studio)

```bash
npx prisma studio
```

Opens a GUI at `http://localhost:5555` to view/edit data.

### Backup Data

```bash
# Export to SQL
pg_dump $DATABASE_URL > backup.sql

# Or use Neon's built-in backups (available in dashboard)
```

### Reset Database

```bash
# WARNING: Deletes all data
npx prisma migrate reset
```

---

## Development Tips

### Hot Reload Issues

If changes aren't reflecting:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Type Errors After Schema Changes

```bash
# Regenerate Prisma Client
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Testing Barcode Scanner

If you don't have a physical barcode scanner:
1. Use keyboard to type values
2. Press Enter to move between fields
3. Barcode scanners work the same way (they simulate keyboard input)

---

## Support

- **Neon Docs**: https://neon.tech/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

For issues with this application, check the README.md file.
