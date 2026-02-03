# Deployment Guide

## Vercel Deployment (Recommended - 5 minutes)

Vercel is the easiest way to deploy Next.js applications and offers a generous free tier.

### Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Neon database already set up

### Step-by-Step Deployment

#### 1. Push to GitHub

```bash
cd laptop-inventory

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Laptop Inventory Scanner"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/laptop-inventory.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

5. Add Environment Variable:
   - Click "Environment Variables"
   - Key: `DATABASE_URL`
   - Value: Your Neon connection string
   - Example: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

6. Click "Deploy"

#### 3. Wait for Deployment

- First deployment takes 2-3 minutes
- Vercel will automatically:
  - Install dependencies
  - Generate Prisma Client
  - Build Next.js app
  - Deploy to global CDN

#### 4. Access Your App

- Vercel provides a URL like: `https://laptop-inventory-xxx.vercel.app`
- You can add a custom domain in Vercel settings

### Automatic Deployments

Every push to `main` branch automatically deploys to production!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically deploys
```

---

## Alternative Platforms

### Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variable:
   - `DATABASE_URL`: Your Neon connection string
5. Railway auto-detects Next.js and deploys

### Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variable:
   - `DATABASE_URL`: Your Neon connection string
6. Click "Create Web Service"

### Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variable:
   - `DATABASE_URL`: Your Neon connection string
6. Deploy

---

## Environment Variables

All platforms require the same environment variable:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

**Important**: Always include `?sslmode=require` for Neon databases!

---

## Post-Deployment Checklist

### 1. Test Core Features

- [ ] Visit your deployed URL
- [ ] Test scanning workflow (enter serial + ELCOT number)
- [ ] Verify data saves to database
- [ ] Test duplicate detection (try same serial/ELCOT twice)
- [ ] Check list page displays entries
- [ ] Test search functionality
- [ ] Download Excel report

### 2. Verify Database Connection

- [ ] Check Vercel logs for any database errors
- [ ] Verify entries appear in Neon dashboard
- [ ] Test from different devices/networks

### 3. Performance Check

- [ ] Page load speed (should be < 2 seconds)
- [ ] Scan form responsiveness
- [ ] Excel export speed

---

## Custom Domain Setup (Optional)

### Vercel

1. Go to your project settings
2. Click "Domains"
3. Add your domain (e.g., `inventory.yourcompany.com`)
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

### Other Platforms

Similar process - check platform documentation for specific steps.

---

## Monitoring & Maintenance

### View Logs

**Vercel**:
- Go to project → "Deployments" → Click deployment → "Logs"

**Railway**:
- Click your service → "Logs" tab

**Render**:
- Click your service → "Logs" tab

### Database Monitoring

**Neon Dashboard**:
- View connection count
- Monitor storage usage
- Check query performance
- Set up usage alerts

### Common Issues

#### "Database connection failed"

**Cause**: DATABASE_URL not set or incorrect

**Fix**:
1. Check environment variable in platform settings
2. Verify connection string format
3. Ensure `?sslmode=require` is present
4. Redeploy after fixing

#### "Prisma Client not generated"

**Cause**: Build script not running correctly

**Fix**:
1. Ensure `package.json` has: `"build": "prisma generate && next build"`
2. Redeploy

#### "Module not found" errors

**Cause**: Dependencies not installed

**Fix**:
1. Check `package.json` includes all dependencies
2. Clear build cache and redeploy

---

## Scaling Considerations

### Database (Neon)

**Free Tier Limits**:
- 0.5 GB storage
- 1 compute unit
- Suitable for ~10,000 entries

**Upgrade When**:
- Storage > 400 MB
- Slow query performance
- Need more concurrent connections

**Upgrade Path**:
- Neon Pro: $19/month (3 GB storage, better performance)

### Application (Vercel)

**Free Tier Limits**:
- 100 GB bandwidth/month
- Unlimited requests
- Suitable for small-medium teams

**Upgrade When**:
- Bandwidth > 80 GB/month
- Need team collaboration features
- Want custom domains on multiple projects

---

## Backup Strategy

### Automated Backups (Neon)

Neon automatically backs up your database:
- Point-in-time recovery available
- Retention: 7 days (free tier), 30 days (paid)

### Manual Backup

```bash
# Export database to SQL file
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240315.sql
```

### Excel Exports as Backup

- Regular Excel exports serve as data backups
- Store in cloud storage (Google Drive, Dropbox)
- Automate with scheduled tasks if needed

---

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env` to git
- ✅ Use different databases for dev/production
- ✅ Rotate database passwords periodically
- ✅ Use read-only credentials for reporting (if needed)

### Database Security

- ✅ Neon uses SSL by default (`sslmode=require`)
- ✅ Enable IP allowlist in Neon (optional)
- ✅ Monitor for unusual query patterns
- ✅ Keep Prisma and dependencies updated

### Application Security

- ✅ Input validation (already implemented)
- ✅ Duplicate prevention (already implemented)
- ✅ Rate limiting (consider adding for production)
- ✅ HTTPS only (automatic with Vercel/Railway/Render)

---

## Cost Estimation

### Free Tier (Suitable for most use cases)

- **Neon**: Free (0.5 GB storage)
- **Vercel**: Free (100 GB bandwidth)
- **Total**: $0/month

**Capacity**: ~10,000 laptop entries, ~1,000 users/month

### Paid Tier (High volume)

- **Neon Pro**: $19/month (3 GB storage)
- **Vercel Pro**: $20/month (1 TB bandwidth)
- **Total**: $39/month

**Capacity**: ~100,000 laptop entries, ~10,000 users/month

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

For application-specific issues, refer to README.md and SETUP.md.
