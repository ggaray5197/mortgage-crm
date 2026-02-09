# Deploying Mortgage CRM to Vercel

This guide will help you deploy your Mortgage CRM to Vercel so you can access it from any computer.

## Prerequisites

1. A [GitHub](https://github.com) account
2. A [Vercel](https://vercel.com) account (free tier works)

## Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it `mortgage-crm`
   - Keep it private (recommended for business data)
   - Click "Create repository"

2. Push your code:
   ```bash
   cd mortgage-crm
   git init
   git add .
   git commit -m "Initial commit - Mortgage CRM with Finance Module"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mortgage-crm.git
   git push -u origin main
   ```

## Step 2: Create a Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" in the top navigation
3. Click "Create Database"
4. Select "Postgres" (Vercel Postgres)
5. Name it `mortgage-crm-db`
6. Click "Create"
7. **Important:** Copy the connection strings shown - you'll need them!

## Step 3: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`mortgage-crm`)
4. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as default)

5. Add Environment Variables (click "Environment Variables"):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Vercel Postgres connection string (pooled) |
   | `DIRECT_URL` | Your Vercel Postgres direct connection string |
   | `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | Leave blank (Vercel auto-detects) |

6. Click "Deploy"

## Step 4: Initialize the Database

After deployment completes:

1. Go to your Vercel project dashboard
2. Click the "..." menu → "Open Terminal" (or use Vercel CLI)
3. Run: `npx prisma db push`

Or use Vercel CLI locally:
```bash
npm i -g vercel
vercel link
vercel env pull .env.local
npx prisma db push
```

## Step 5: Create Your Account

1. Visit your deployed app at `https://your-app.vercel.app`
2. The login page will appear
3. You'll need to create an account through the database:

```bash
# Run locally with production database
vercel env pull .env.local
npx tsx prisma/seed.ts
```

Or manually create a user via Prisma Studio:
```bash
npx prisma studio
```

**Default login after seeding:**
- Email: `demo@mortgagecrm.com`
- Password: `password123`

## Accessing Your CRM

Once deployed, you can access your CRM from any computer at:
```
https://your-project-name.vercel.app
```

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain (e.g., `crm.yourbusiness.com`)
4. Follow the DNS configuration instructions

## Updating Your App

Whenever you push changes to GitHub, Vercel automatically redeploys:

```bash
git add .
git commit -m "Your changes"
git push
```

## Troubleshooting

### Database Connection Issues
- Make sure both `DATABASE_URL` and `DIRECT_URL` are set
- Verify the connection strings are from Vercel Postgres

### Build Failures
- Check the Vercel deployment logs
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Make sure you ran the database seed

## Costs

- **Vercel Hobby Plan:** Free (includes Postgres database)
- **Vercel Pro Plan:** $20/month (if you need more resources)

The free tier should work fine for personal/small business use!
