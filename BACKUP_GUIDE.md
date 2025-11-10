# Backup & Download Guide

## Quick Backup Methods

### Method 1: Create Backup Archive (Recommended)

```bash
# Navigate to project root
cd /tmp/cc-agent/59816467

# Create timestamped backup
DATE=$(date +%Y%m%d_%H%M%S)
ZIP_NAME="agent-protocols-backup_${DATE}.zip"

# Create zip excluding unnecessary files
zip -r $ZIP_NAME project \
  -x "project/node_modules/*" \
  -x "project/.git/*" \
  -x "project/dist/*" \
  -x "project/.env.local"

echo "Backup created: $ZIP_NAME"
```

### Method 2: Essential Files Only

```bash
# Create smaller backup with just source code
cd /tmp/cc-agent/59816467/project

zip -r ../agent-protocols-essential.zip \
  src/ \
  supabase/ \
  public/ \
  *.json \
  *.ts \
  *.js \
  *.md \
  .env

echo "Essential files backed up to ../agent-protocols-essential.zip"
```

### Method 3: Database Export

```bash
# Export Supabase database schema
# (Run from project directory)
npx supabase db dump -f backup/schema.sql

# Or manually via Supabase Dashboard:
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Database → Backups → Download
```

## What's Included in Full Backup

### Source Code (Required)
```
src/
├── components/      # All UI components
├── services/        # Business logic
├── protocols/       # Protocol definitions (9 types)
├── contexts/        # React contexts (Auth, Theme)
├── data/           # CSV business process data
└── lib/            # Utilities
```

### Database Migrations (Required)
```
supabase/migrations/
├── 20251106*.sql   # Phase 1: Protocols
├── 20251107*.sql   # Phase 2: Workspaces
└── 20251108*.sql   # Phase 3: Pipelines
```

### Configuration (Required)
```
package.json         # Dependencies
package-lock.json    # Locked versions
tsconfig.json        # TypeScript config
vite.config.ts       # Vite config
tailwind.config.js   # Styling
.env                 # Supabase credentials (IMPORTANT!)
```

### Documentation (Recommended)
```
PHASE1_DOCUMENTATION.md
PHASE2_DOCUMENTATION.md  
PHASE3_DOCUMENTATION.md
PHASE3.5_IMPLEMENTATION.md
NEW_PROTOCOLS_GUIDE.md
COLLABORATION_GUIDE.md
BACKUP_GUIDE.md (this file)
```

### Generated Files (Not Needed - Will Regenerate)
```
node_modules/        # npm install
dist/                # npm run build
.cache/              # Temporary files
```

## Restoring from Backup

### Step 1: Extract Files

```bash
# Extract backup
unzip agent-protocols-backup_YYYYMMDD_HHMMSS.zip

cd project
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
# Create .env file with your Supabase credentials
cat > .env << 'ENVFILE'
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
ENVFILE
```

### Step 4: Run Migrations (If New Database)

```bash
# If using new Supabase project, run migrations
npx supabase db push
```

### Step 5: Start Development

```bash
npm run dev
```

### Step 6: Verify

- Open http://localhost:5173
- Sign up for new account
- Check all protocol types work
- Test pipeline builder
- Verify real-time collaboration

## Downloading to Local Machine

### Option 1: Via Terminal Access

If you have terminal/SSH access:

```bash
# From your local machine
scp -r user@server:/tmp/cc-agent/59816467/agent-protocols-backup*.zip ~/Downloads/

# Or using rsync
rsync -avz user@server:/tmp/cc-agent/59816467/agent-protocols-backup*.zip ~/Downloads/
```

### Option 2: Via Web Interface

If using cloud IDE (Replit, CodeSandbox, etc.):

1. Create zip file (Method 1 above)
2. Look for "Download" or "Export" button in IDE
3. Navigate to file location
4. Right-click → Download

### Option 3: Via Git Repository

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Phase 3.5 complete - backup"

# Push to your repository
git remote add origin your-git-repo-url
git push -u origin main

# Download from Git on any machine
git clone your-git-repo-url
```

## Cloud Storage Upload

### Google Drive (via rclone)

```bash
# Configure rclone (one-time setup)
rclone config

# Upload to Google Drive
rclone copy agent-protocols-backup*.zip gdrive:Backups/
```

### Dropbox

```bash
# Using Dropbox CLI
dropbox upload agent-protocols-backup*.zip /Backups/
```

### AWS S3

```bash
aws s3 cp agent-protocols-backup*.zip s3://your-bucket/backups/
```

## Backup Checklist

Before downloading, verify your backup includes:

- [ ] All source code (src/, supabase/)
- [ ] Configuration files (package.json, tsconfig.json, etc.)
- [ ] Environment variables (.env with Supabase credentials)
- [ ] Documentation files (*.md)
- [ ] Business process data (CSV file)
- [ ] Migration files (supabase/migrations/*.sql)

## Important Notes

### ⚠️ .env File

**CRITICAL**: Your `.env` file contains Supabase credentials. Without it:
- The app won't connect to database
- Authentication won't work
- Real-time features will fail

**Always include .env in backups** (but not in public Git repos!)

### Database Data

Your backup includes:
- ✅ Schema (table structures)
- ✅ Migrations (how to recreate tables)
- ❌ Actual data (protocols, pipelines, users)

**To backup data:**
```bash
# Via Supabase Dashboard
1. Database → Backups → Create backup
2. Download backup file

# Or via pg_dump
pg_dump $DATABASE_URL > backup/data.sql
```

### Workspace Collaboration

If you have team members:
1. Backup includes code only
2. Each team member needs their own Supabase account
3. Share the Supabase project credentials
4. Team members create accounts in the app

## Automated Backup Script

```bash
#!/bin/bash
# save as: backup.sh

PROJECT_DIR="/tmp/cc-agent/59816467/project"
BACKUP_DIR="/tmp/cc-agent/59816467/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
cd /tmp/cc-agent/59816467
zip -r "$BACKUP_DIR/agent-protocols-backup_${DATE}.zip" project \
  -x "project/node_modules/*" \
  -x "project/.git/*" \
  -x "project/dist/*"

# Keep only last 5 backups
cd $BACKUP_DIR
ls -t agent-protocols-backup_*.zip | tail -n +6 | xargs -r rm

echo "Backup complete: $BACKUP_DIR/agent-protocols-backup_${DATE}.zip"

# Optional: Upload to cloud
# rclone copy "$BACKUP_DIR/agent-protocols-backup_${DATE}.zip" gdrive:Backups/
```

Make executable and run:
```bash
chmod +x backup.sh
./backup.sh
```

## Recovery Testing

**Always test your backups!**

```bash
# 1. Extract to new location
mkdir /tmp/test-restore
cd /tmp/test-restore
unzip /path/to/backup.zip

# 2. Install and run
cd project
npm install
npm run dev

# 3. Verify functionality
# - Can you sign in?
# - Do protocols load?
# - Does pipeline builder work?
```

## Continuous Backup Strategy

### Daily Automated Backups

```bash
# Add to crontab
crontab -e

# Run backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Version Control

```bash
# Commit changes regularly
git add .
git commit -m "Update: [description]"
git push

# Tag important versions
git tag -a v3.5 -m "Phase 3.5 complete"
git push --tags
```

### Cloud Sync

```bash
# Real-time sync with Dropbox/Drive
rclone sync $PROJECT_DIR gdrive:AgentProtocols \
  --exclude node_modules/** \
  --exclude dist/** \
  --exclude .git/**
```

## Emergency Recovery

If you lose access to the project:

1. **Retrieve from Git**: `git clone your-repo-url`
2. **Download from Cloud**: `rclone copy gdrive:Backups/latest.zip .`
3. **Contact Supabase**: Database backups available in dashboard
4. **Restore**: Follow "Restoring from Backup" steps above

## Support

If you encounter issues:

1. Check `.env` file has correct Supabase credentials
2. Verify `node_modules` installed: `npm install`
3. Check Node version: `node --version` (should be 16+)
4. Clear cache: `rm -rf node_modules dist && npm install`
5. Check Supabase project is active in dashboard

---

**Backup Status**: Your project is ready to backup and download!

Run the Quick Backup Method 1 to create your backup file, then download it to your local machine for safekeeping.
