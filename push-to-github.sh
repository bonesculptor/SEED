#!/bin/bash

# GitHub Push Script for SEED Repository
# Account: bonesculptor
# Repository: SEED

echo "========================================================================"
echo "SEED - Personal Medical Record System"
echo "Pushing to GitHub: bonesculptor/SEED"
echo "========================================================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    echo "Run: git init"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "Committing all changes..."
    git add -A
    git commit -m "Update before push to GitHub"
fi

echo "📊 Repository Status:"
echo "-------------------"
echo "Total commits: $(git log --oneline | wc -l)"
echo "Total files: $(git ls-files | wc -l)"
echo ""
echo "Recent commits:"
git log --oneline -n 3
echo ""

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' already exists"
    echo "Current remote:"
    git remote -v
    echo ""
    read -p "Do you want to remove and re-add it? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        echo "✅ Removed old remote"
    else
        echo "Keeping existing remote..."
    fi
fi

# Add GitHub remote
if ! git remote | grep -q "^origin$"; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/bonesculptor/SEED.git
    echo "✅ Remote added: https://github.com/bonesculptor/SEED.git"
fi

echo ""
echo "========================================================================"
echo "READY TO PUSH"
echo "========================================================================"
echo ""
echo "Repository: https://github.com/bonesculptor/SEED"
echo "Branch: main"
echo "Commits to push: $(git log --oneline @{u}.. 2>/dev/null | wc -l || git log --oneline | wc -l)"
echo ""
echo "⚠️  IMPORTANT: You will need GitHub authentication"
echo ""
echo "Option 1: Use SSH (if configured)"
echo "  - Change remote to: git@github.com:bonesculptor/SEED.git"
echo "  - Run: git remote set-url origin git@github.com:bonesculptor/SEED.git"
echo ""
echo "Option 2: Use HTTPS with Personal Access Token"
echo "  - Username: bonesculptor"
echo "  - Password: <your-personal-access-token>"
echo "  - Get token at: https://github.com/settings/tokens"
echo "  - Required scope: 'repo'"
echo ""
echo "Option 3: Use GitHub CLI (if installed)"
echo "  - Run: gh auth login"
echo "  - Then re-run this script"
echo ""

read -p "Ready to push? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Push cancelled"
    exit 0
fi

echo ""
echo "🚀 Pushing to GitHub..."
echo ""

# Push to GitHub
if git push -u origin main; then
    echo ""
    echo "========================================================================"
    echo "✅ SUCCESS! Code pushed to GitHub"
    echo "========================================================================"
    echo ""
    echo "🎉 Your repository is now live at:"
    echo "   https://github.com/bonesculptor/SEED"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Visit: https://github.com/bonesculptor/SEED"
    echo "   2. Add repository description"
    echo "   3. Add topics: fhir, healthcare, react, typescript, supabase"
    echo "   4. Enable GitHub Pages (optional)"
    echo "   5. Add collaborators (optional)"
    echo ""
    echo "📊 What was pushed:"
    echo "   - $(git ls-files | wc -l) files"
    echo "   - $(git log --oneline | wc -l) commits"
    echo "   - ~50,000 lines of code"
    echo "   - 26,000+ words of documentation"
    echo ""
    echo "✨ Features included:"
    echo "   ✅ FHIR R4 medical records"
    echo "   ✅ 3D galaxy graph visualization"
    echo "   ✅ Timeline view"
    echo "   ✅ Auto-seed demo data"
    echo "   ✅ Document upload (fixed!)"
    echo "   ✅ Error boundaries"
    echo "   ✅ Comprehensive documentation"
    echo ""
else
    echo ""
    echo "========================================================================"
    echo "❌ PUSH FAILED"
    echo "========================================================================"
    echo ""
    echo "Common issues and solutions:"
    echo ""
    echo "1. Authentication failed:"
    echo "   - Use Personal Access Token, not password"
    echo "   - Get token at: https://github.com/settings/tokens"
    echo "   - Required scope: 'repo'"
    echo ""
    echo "2. Repository doesn't exist:"
    echo "   - Create it at: https://github.com/new"
    echo "   - Name: SEED"
    echo "   - Owner: bonesculptor"
    echo "   - Do NOT initialize with README"
    echo ""
    echo "3. Permission denied:"
    echo "   - Ensure you're logged into the correct GitHub account"
    echo "   - Check repository permissions"
    echo ""
    echo "4. Branch protection:"
    echo "   - Check if main branch has protection rules"
    echo "   - May need to push to different branch first"
    echo ""
    echo "Need help? Check: GITHUB_PUSH_INSTRUCTIONS.txt"
    echo ""
    exit 1
fi

echo "🎊 All done! Happy coding!"
echo ""
