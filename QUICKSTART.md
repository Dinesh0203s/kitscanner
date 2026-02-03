# Quick Start Guide - 5 Minutes to Running App

## Step 1: Get Neon Database (2 minutes)

1. Visit: https://console.neon.tech
2. Sign up (free)
3. Click "Create Project"
4. Copy the connection string shown

## Step 2: Configure Environment (30 seconds)

Create `.env` file in `laptop-inventory` folder:

```env
DATABASE_URL="paste-your-connection-string-here?sslmode=require"
```

**Important**: Add `?sslmode=require` at the end!

## Step 3: Setup Database (1 minute)

```bash
cd laptop-inventory
npx prisma generate
npx prisma db push
```

## Step 4: Start App (30 seconds)

```bash
npm run dev
```

Open: http://localhost:3000

## Step 5: Test It! (1 minute)

1. Enter Serial Number: `TEST001`
2. Press Enter
3. Enter ELCOT Number: `ELCOT001`
4. Press Enter (auto-saves!)
5. Click "View List" to see your entry
6. Click "Download Excel" to export

---

## That's It! 🎉

You now have a fully functional laptop inventory system.

### Next Steps:

- **Deploy to Production**: See `DEPLOYMENT.md`
- **Detailed Setup**: See `SETUP.md`
- **Features Guide**: See `README.md`

### Using with Barcode Scanner:

Your barcode scanner works like a keyboard:
1. Scan serial number barcode → auto-fills first field
2. Scanner sends "Enter" → moves to second field
3. Scan ELCOT barcode → auto-fills second field
4. Scanner sends "Enter" → auto-saves!

No configuration needed - it just works!

---

## Troubleshooting

**Can't connect to database?**
- Check your `.env` file exists
- Verify connection string has `?sslmode=require`
- Ensure Neon project is active

**Port 3000 in use?**
```bash
npm run dev -- -p 3001
```

**Need to reset?**
```bash
npx prisma migrate reset
```

---

## Quick Commands Reference

```bash
# Start development server
npm run dev

# View database in browser
npx prisma studio

# Create database backup
npx prisma db push

# Reset everything
npx prisma migrate reset
```

---

**Need Help?** Check the detailed guides:
- `SETUP.md` - Detailed setup instructions
- `DEPLOYMENT.md` - Deploy to production
- `README.md` - Full feature documentation
