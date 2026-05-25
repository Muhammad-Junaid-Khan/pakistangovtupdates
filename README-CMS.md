# 🇵🇰 PakistanGovtUpdates.com - Advanced CMS System

> Professional static website with a fully-featured Admin Dashboard for managing government jobs, schemes, scholarships, and courses in Pakistan. GitHub Pages compatible, no backend required.

## ⚡ Quick Features

- 📊 **Professional Admin Dashboard** - Manage all content without coding
- 🔐 **GitHub OAuth Authentication** - Secure admin access
- 💼 **Complete CMS** - Jobs, Schemes, Courses, Scholarships, Blog Posts
- 🌐 **GitHub Pages Ready** - Deploy instantly, no server costs
- 🎨 **Responsive Design** - Mobile, tablet, and desktop optimized
- 📱 **WhatsApp Integration** - Floating chat button and support cards
- 📧 **EmailJS Contact System** - Automatic email notifications
- 🔍 **SEO Optimized** - Schema markup, meta tags, sitemaps
- 💬 **Contact Management** - View and manage inquiries in admin
- 📸 **Media Upload** - Built-in image and video management

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/PakistanGovtUpdates.git
cd PakistanGovtUpdates
```

### 2. Access Admin Dashboard
```
Navigate to: http://yourdomain.com/admin
Click "Sign in with GitHub"
Start creating content!
```

### 3. Configure EmailJS (Optional)
1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Create an email service
3. Create email template
4. Copy `Public Key`, `Service ID`, `Template ID`
5. Replace in `assets/js/main.js` and `admin/admin.js`

### 4. Deploy to GitHub Pages
1. Push to repository
2. Enable Pages in repository settings
3. Select main branch
4. Site automatically deploys!

## 📁 File Structure

```
├── admin/                 # CMS Admin Dashboard
│   ├── index.html        # Admin panel interface
│   ├── admin.css         # Admin styling
│   ├── admin.js          # CMS logic
│   └── config.yml        # Decap CMS config
├── assets/
│   ├── css/style.css     # Main stylesheet
│   ├── js/main.js        # Frontend logic
│   └── images/           # Logo and images
├── data/
│   ├── jobs.json         # Jobs database
│   ├── schemes.json      # Schemes database
│   ├── courses.json      # Courses database
│   ├── scholarships.json # Scholarships
│   └── posts.json        # Blog posts
├── blog/
│   ├── index.html        # Blog listing
│   └── post-template.html # Post viewer
├── index.html            # Homepage
├── categories.html       # Categories page
├── contact.html          # Contact form
├── disclaimer.html       # Disclaimer page
├── about.html            # About page
└── README.md            # This file
```

## 🎯 Content Types

### Jobs
- Job title, department, category
- Eligibility, education, age limit
- Application details and links
- Required documents
- SEO optimization

### Schemes
- Scheme title and department
- Eligibility and benefits
- Registration process
- Deadlines and links
- Document requirements

### Courses
- Course title and institute
- Duration and eligibility
- Application process
- Category and official links

### Scholarships
- Scholarship name and country
- Eligibility requirements
- Application process
- Required documents

### Blog Posts
- Title and category
- Rich content
- Featured image
- SEO meta tags

## 🔧 Configuration

### EmailJS Setup
Replace placeholders in `assets/js/main.js`:
```javascript
emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');
emailjs.send('service_YOUR_SERVICE', 'template_YOUR_TEMPLATE', payload)
```

### WhatsApp Integration
Update WhatsApp number in `assets/js/main.js`:
```javascript
const WHATSAPP_NUMBER = '+923015057401'; // Replace with your number
```

### Analytics
Add Google Analytics ID in admin settings or index.html head section.

## 💻 Admin Dashboard Guide

### Tabs Available
1. **Dashboard** - Statistics and recent activity
2. **Add Job** - Publish new job postings
3. **Add Scheme** - Create government scheme listings
4. **Add Course** - Upload NAVTTC courses
5. **Add Scholarship** - Post international scholarships
6. **Add Update** - Write blog posts and guides
7. **Media** - Upload and manage images/videos
8. **SEO Settings** - Configure site metadata
9. **Messages** - View contact form submissions
10. **Analytics** - View visitor statistics

### Publishing Workflow
1. Select content type from sidebar
2. Fill in all required fields
3. Upload featured image
4. Configure SEO settings
5. Click "Publish"
6. Content automatically saves to JSON
7. Website updates in real-time

## 🌐 Website Structure

### Public Pages
- **Homepage** (`/`) - Featured jobs, schemes, latest updates
- **Categories** (`/categories.html`) - Browse by job type
- **Blog** (`/blog/`) - Articles and guides
- **Search** (`/search.html`) - Find jobs and schemes
- **Contact** (`/contact.html`) - Get in touch
- **About** (`/about.html`) - About the website
- **Disclaimer** (`/disclaimer.html`) - Legal disclaimer

### Admin Area
- **Admin Dashboard** (`/admin`) - Content management
- GitHub OAuth authentication required
- Full CRUD operations for all content types

## 🔐 Security Features

- ✅ GitHub OAuth for admin access
- ✅ No database exposed
- ✅ HTTPS on GitHub Pages
- ✅ localStorage for user data
- ✅ Input validation on forms
- ✅ XSS protection

## 📊 SEO Features

- ✅ Schema markup (JobPosting, Article)
- ✅ Meta tags and descriptions
- ✅ OpenGraph tags for social sharing
- ✅ Canonical URLs
- ✅ XML sitemap
- ✅ Robots.txt
- ✅ Mobile-responsive
- ✅ Fast page load times

## 🎨 Customization

### Colors
Edit CSS variables in `assets/css/style.css`:
```css
:root {
  --blue: #0a66c2;
  --blue-dark: #053c7a;
  --muted: #4e627f;
}
```

### Website Name
Replace "PakistanGovtUpdates.com" with your domain in:
- `index.html` - title and meta tags
- `admin/admin.js` - dashboard header
- `assets/js/main.js` - SEO references

## 🚨 Important Notes

### Disclaimers
⚠️ The website includes legal disclaimers that:
- State you're NOT a government organization
- Provide information for educational purposes only
- Do NOT guarantee job selection or scheme approval
- Warn against government job scams

### GitHub Pages Limitations
- Static HTML only (no backend)
- 1GB size limit
- 100GB bandwidth/month
- Content managed via JSON files
- No server-side processing

### Email Configuration
- EmailJS uses client-side delivery
- Reliable for transactional emails
- Alternative: Formspree, Netlify Forms
- Messages also saved to localStorage

## 🐛 Troubleshooting

### Admin Panel Not Loading
- Clear browser cache
- Try incognito mode
- Check GitHub connectivity
- Verify admin/index.html exists

### Content Not Appearing
- Check JSON file syntax
- Verify JSON paths are correct
- Wait for GitHub Pages to rebuild
- Check browser console for errors

### Contact Form Not Working
- Verify EmailJS configuration
- Check for API key errors
- Review browser console
- Messages still save locally

## 📱 Mobile Optimization

- Hamburger menu on small screens
- Touch-friendly buttons
- Responsive grid layouts
- Optimized images
- Fast loading on 3G
- Accessible form controls

## 📧 Support

- **Email**: junaidkhanldk@gmail.com
- **WhatsApp**: +92 301 5057401
- **Portfolio**: https://muhammad-junaid-khan.github.io/myportfolio/

## 📄 License

This project is open source and free to use. Attribution appreciated but not required.

---

**Made with ❤️ for Pakistan**

*Professional government updates portal built with modern web technologies.*

**Version:** 1.0.0 | **Last Updated:** May 2026 | **GitHub Pages Compatible**
