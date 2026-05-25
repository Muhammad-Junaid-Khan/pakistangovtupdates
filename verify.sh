#!/bin/bash
# VERIFICATION SCRIPT - Pakistan Govt Updates CMS
# Run this to verify all files are in place

echo "🔍 Verifying Pakistan Govt Updates CMS Installation"
echo "=================================================="
echo ""

files=(
    "admin/index.html"
    "admin/admin.js"
    "admin/admin.css"
    "admin/config.yml"
    "assets/js/main.js"
    "assets/css/style.css"
    "data/jobs.json"
    "data/schemes.json"
    "data/courses.json"
    "data/scholarships.json"
    "data/posts.json"
    "index.html"
    "contact.html"
    "disclaimer.html"
    "categories.html"
    "search.html"
    "blog/index.html"
    "blog/post-template.html"
    "sitemap.xml"
    "robots.txt"
    "README.md"
    "DOCUMENTATION.md"
    "DEPLOYMENT.md"
    "COMPLETION_SUMMARY.md"
    "QUICK-REFERENCE.md"
)

echo "✓ Checking for required files..."
echo ""

missing=0
found=0

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
        ((found++))
    else
        echo "❌ $file (MISSING)"
        ((missing++))
    fi
done

echo ""
echo "================================"
echo "📊 Verification Results:"
echo "   Found: $found files"
echo "   Missing: $missing files"
echo ""

if [ $missing -eq 0 ]; then
    echo "✅ All files present! Ready for deployment."
else
    echo "⚠️  $missing files missing. Please create them."
fi

echo ""
echo "🚀 Next Steps:"
echo "   1. Update configuration (EmailJS, WhatsApp, etc.)"
echo "   2. Customize branding (colors, logo, text)"
echo "   3. Add your content via admin dashboard"
echo "   4. Deploy to GitHub Pages"
echo "   5. Monitor and maintain"
echo ""
echo "📖 Documentation:"
echo "   - README-CMS.md: Feature guide"
echo "   - DOCUMENTATION.md: Detailed docs"
echo "   - DEPLOYMENT.md: Deploy steps"
echo "   - QUICK-REFERENCE.md: Quick lookup"
echo ""
echo "Happy publishing! 🎉"
