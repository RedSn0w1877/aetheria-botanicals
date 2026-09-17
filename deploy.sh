#!/usr/bin/env bash
# Quick deployment script for Aetheria Botanicals
# Usage: ./deploy.sh [github-username]

set -e

USERNAME=${1:-"your-username"}
REPO_NAME="aetheria-botanicals"
REPO_URL="https://github.com/${USERNAME}/${REPO_NAME}.git"

echo "🌿 Aetheria Botanicals — Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if git remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✓ Git remote 'origin' already configured"
    CURRENT_URL=$(git remote get-url origin)
    echo "  Current: $CURRENT_URL"
else
    echo "→ Adding git remote..."
    git remote add origin "$REPO_URL"
    echo "✓ Remote added: $REPO_URL"
fi

echo ""
echo "→ Pushing to GitHub..."
git push -u origin main

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Code pushed successfully!"
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/${USERNAME}/${REPO_NAME}/settings/pages"
echo "2. Under 'Build and deployment', select 'GitHub Actions'"
echo "3. Wait ~2 minutes for the workflow to complete"
echo "4. Visit: https://${USERNAME}.github.io/${REPO_NAME}/"
echo ""
echo "🌿 Deployment complete!"
