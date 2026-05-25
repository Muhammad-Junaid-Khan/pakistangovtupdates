#!/bin/bash
# SETUP GUIDE - PakistanGovtUpdates CMS System
# Run this script to configure your installation

echo "🚀 Pakistan Govt Updates - CMS Setup"
echo "===================================="
echo ""

# Check Node.js (optional for build tools)
if command -v node &> /dev/null
then
    echo "✅ Node.js found: $(node --version)"
else
    echo "⚠️  Node.js not found (optional, for advanced builds)"
fi

# Create data directories if missing
echo "📁 Creating data directories..."
mkdir -p data
mkdir -p admin
mkdir -p assets/images/uploads

echo "✅ Directories created"
echo ""

echo "📝 Configuration Steps:"
echo "1. Update EmailJS Configuration:"
echo "   - Sign up at https://www.emailjs.com"
echo "   - Replace YOUR_EMAILJS_PUBLIC_KEY in:"
echo "     • assets/js/main.js"
echo "     • admin/admin.js"
echo ""

echo "2. Update WhatsApp Number:"
echo "   - Replace +923015057401 with your number in:"
echo "     • assets/js/main.js"
echo "     • contact.html"
echo ""

echo "3. GitHub Pages Deployment:"
echo "   - Push code to GitHub repository"
echo "   - Enable Pages in repository settings"
echo "   - Select 'main' branch as source"
echo ""

echo "4. Custom Domain (Optional):"
echo "   - Add CNAME file with your domain"
echo "   - Update DNS settings"
echo ""

echo "5. Analytics (Optional):"
echo "   - Get Google Analytics ID"
echo "   - Add in admin SEO Settings"
echo ""

echo "✨ Setup complete! Visit /admin to start creating content."
