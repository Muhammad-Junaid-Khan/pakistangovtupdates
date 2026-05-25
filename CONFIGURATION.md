# 🔧 CONFIGURATION TEMPLATE

Use this file as a checklist for customizing your installation.

## 📝 BEFORE DEPLOYMENT

Copy this section and replace values throughout your project.

```
OLD_VALUE → NEW_VALUE

junaidkhanldk@gmail.com → YOUR_EMAIL@gmail.com
+923015057401 → YOUR_PHONE_NUMBER
Muhammad Junaid Khan → YOUR_NAME
https://muhammad-junaid-khan.github.io/myportfolio/ → YOUR_PORTFOLIO_URL
#0a66c2 (blue) → YOUR_PRIMARY_COLOR
#053c7a (blue dark) → YOUR_SECONDARY_COLOR
PakistanGovtUpdates.com → YOUR_WEBSITE_NAME
```

## 🔐 EMAILJS CONFIGURATION

### Step 1: Get Your Credentials
1. Visit https://www.emailjs.com
2. Create account or login
3. Go to Admin Panel → Email Services
4. Create new service (Gmail, Outlook, custom SMTP)
5. Note your Service ID

### Step 2: Create Email Template
1. Go to Email Templates
2. Create new template with variables:
   ```
   {{from_name}}
   {{from_email}}
   {{subject}}
   {{message}}
   ```
3. Note your Template ID

### Step 3: Get Public Key
1. Go to Account
2. Copy your Public Key

### Step 4: Update Configuration
Replace in `/assets/js/main.js`:
```javascript
// OLD:
emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');
emailjs.send('service_YOUR_SERVICE', 'template_YOUR_TEMPLATE', {

// NEW:
emailjs.init('pk_test_YOUR_ACTUAL_PUBLIC_KEY_HERE');
emailjs.send('service_abc123def456', 'template_xyz789uvw012', {
```

Also update in `/admin/admin.js` if used there.

## 📱 WHATSAPP CONFIGURATION

### Update Phone Number
Replace `+923015057401` with your WhatsApp number in:

1. **assets/js/main.js**
   ```javascript
   // Change:
   const WHATSAPP_NUMBER = '+923015057401';
   // To:
   const WHATSAPP_NUMBER = '+92XXXXXXXXXX';
   ```

2. **index.html**
   ```html
   <!-- Footer link -->
   <a href="https://wa.me/923015057401">WhatsApp Us</a>
   <!-- Change to: -->
   <a href="https://wa.me/92XXXXXXXXXX">WhatsApp Us</a>
   ```

3. **contact.html**
   ```html
   <!-- Support card link -->
   <a href="https://wa.me/923015057401">Chat on WhatsApp</a>
   <!-- Change to: -->
   <a href="https://wa.me/92XXXXXXXXXX">Chat on WhatsApp</a>
   ```

## 👤 DEVELOPER INFORMATION

### Update Your Details
Replace throughout project:

1. **Footer - All Pages**
   ```html
   <!-- OLD: -->
   Designed & Developed by Junaid Khan
   <!-- NEW: -->
   Designed & Developed by [Your Name]
   
   <!-- Portfolio link -->
   https://muhammad-junaid-khan.github.io/myportfolio/
   ```

2. **Contact Information**
   ```
   Email: junaidkhanldk@gmail.com → your-email@example.com
   WhatsApp: +923015057401 → your-number
   Portfolio: [your-portfolio-url]
   ```

3. **Admin Panel Header**
   - Update footer text
   - Update developer credits

## 🎨 COLOR SCHEME

### Update Brand Colors
Edit `/assets/css/style.css` CSS variables:

```css
:root {
    /* Primary Colors */
    --blue: #0a66c2;              /* Change this */
    --blue-dark: #053c7a;         /* Change this */
    
    /* Other colors to customize */
    --muted: #4e627f;
    --success: #0d6b20;
    --error: #bf1e2e;
    --warn: #f59e0b;
}
```

Common color codes:
- Red: #dc2626, #991b1b
- Green: #059669, #065f46
- Purple: #7c3aed, #5b21b6
- Blue: #0a66c2, #053c7a (current)
- Orange: #ea580c, #b45309

## 🏷️ WEBSITE IDENTITY

### Change Website Name/Title
Search and replace in all HTML files:

1. **Browser Tab Title**
   ```html
   <title>PakistanGovtUpdates - Jobs & Schemes</title>
   <!-- Change to: -->
   <title>Your Site Name - Description</title>
   ```

2. **Meta Description**
   ```html
   <meta name="description" content="Pakistan government jobs, schemes, courses...">
   <!-- Update description -->
   ```

3. **Header/Logo Text**
   - Update in index.html
   - Update in admin/index.html
   - Update in all pages

4. **Footer Company Name**
   - Update throughout footer
   - Update in contact page
   - Update in about page

## 🔗 GOOGLE SERVICES (Optional)

### Google Analytics Setup
1. Create property at analytics.google.com
2. Get Measurement ID (starts with G-)
3. Add to `/assets/js/main.js`:
   ```javascript
   window.dataLayer = window.dataLayer || [];
   function gtag(){dataLayer.push(arguments);}
   gtag('js', new Date());
   gtag('config', 'G-XXXXXXXXXX');  // Replace ID
   ```

### Google AdSense Setup (Optional)
1. Apply at adsense.google.com
2. Get Publisher ID
3. Add ad code to pages where you want ads
4. Update /index.html and other pages

## 📱 RESPONSIVE DESIGN

### Mobile Testing
The site is already responsive but verify:
- Test on iPhone 12, 14, 15
- Test on Android phones
- Test on tablets (iPad, Galaxy Tab)
- Test on desktop browsers

### Breakpoints (Pre-configured)
```css
Mobile:     320px - 767px
Tablet:     768px - 1023px
Desktop:    1024px - 1399px
Large:      1400px+
```

No changes needed unless you want custom breakpoints.

## 🔐 SECURITY CHECKLIST

Before deploying:
- ✅ Remove/update test credentials
- ✅ Hide sensitive API keys
- ✅ Review admin authentication
- ✅ Update GitHub OAuth settings
- ✅ Enable HTTPS (automatic on GitHub Pages)
- ✅ Set up .gitignore for secrets
- ✅ Review permissions
- ✅ Test input validation

## 🌐 DOMAIN CONFIGURATION

### GitHub Pages Custom Domain
1. Create `CNAME` file (no extension)
2. Add your domain: `yourdomain.com`
3. Push to GitHub
4. Update DNS records:
   ```
   A record: 185.199.108.153
   A record: 185.199.109.153
   A record: 185.199.110.153
   A record: 185.199.111.153
   CNAME: www → yourdomain.com
   ```

### SSL Certificate
- Automatic on GitHub Pages
- Check "Enforce HTTPS" in settings
- Wait 10-20 minutes for certificate

## 📧 CONTACT FORM CONFIGURATION

### EmailJS Integration
- Already integrated in `/assets/js/main.js`
- Update credentials (see EmailJS section above)
- Test form before deploying
- Check spam folder for test emails

### Fallback Storage
- Messages auto-stored in localStorage
- Admin can view in /admin → Contact Messages
- No email needed - messages always saved

## 💾 DATA MANAGEMENT

### Initial Data
Sample data provided in:
- `/data/jobs.json` - 4 jobs
- `/data/schemes.json` - 4 schemes
- `/data/courses.json` - 2 courses
- `/data/scholarships.json` - 2 scholarships
- `/data/posts.json` - 4 posts

### Add More Data
1. Admin dashboard: Click "Add [Type]"
2. Fill form with details
3. Click "Publish"
4. Data saved to JSON
5. Appears on website

### Manual JSON Editing
1. Open `/data/[type].json` in editor
2. Add new object following existing format
3. Save file
4. Data appears on website

## 🧪 TESTING CHECKLIST

Before deployment:

**Functionality**
- ✅ Contact form sends emails
- ✅ Admin dashboard loads
- ✅ Can add jobs
- ✅ Can upload images
- ✅ Search works
- ✅ WhatsApp button works
- ✅ Links not broken

**Design**
- ✅ Mobile looks good
- ✅ Tablet looks good
- ✅ Desktop looks good
- ✅ Colors are correct
- ✅ Logo displays
- ✅ Fonts render properly

**Performance**
- ✅ Pages load quickly
- ✅ Images optimized
- ✅ No console errors
- ✅ No broken links
- ✅ Forms validate

**SEO**
- ✅ Meta tags present
- ✅ OG tags set
- ✅ Schema markup valid
- ✅ Sitemap updated
- ✅ Robots.txt correct

## 📋 DEPLOYMENT CHECKLIST

- [ ] Update all configuration values
- [ ] Replace EmailJS credentials
- [ ] Update phone number
- [ ] Change colors/branding
- [ ] Update contact information
- [ ] Test all forms
- [ ] Verify responsive design
- [ ] Check all links
- [ ] Review content
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Enable GitHub Pages
- [ ] Configure custom domain
- [ ] Set up SSL
- [ ] Test live website
- [ ] Submit to search engines

## 📚 CONFIGURATION FILES

### Key Files to Customize

1. **/assets/js/main.js**
   - EmailJS credentials
   - WhatsApp number
   - Analytics ID
   - Website name

2. **/admin/admin.js**
   - Site title
   - Admin settings
   - Logo/branding

3. **index.html, contact.html, etc.**
   - Footer information
   - Developer credits
   - Contact details
   - Links

4. **/assets/css/style.css**
   - Color scheme
   - Font families
   - Sizing

## ✅ FINAL VERIFICATION

Once configured:
1. Visit homepage - looks good?
2. Try admin dashboard - works?
3. Create test job - saves?
4. Try contact form - emails?
5. Test WhatsApp - opens correctly?
6. Check mobile - responsive?
7. Review footer - has your info?
8. Verify colors - match brand?

## 🚀 YOU'RE READY!

Once all configurations complete:
1. Push to GitHub
2. Enable Pages
3. Domain configuration
4. Start managing content!

For questions, see:
- README-CMS.md
- DOCUMENTATION.md
- DEPLOYMENT.md

---

**Configuration Version**: 1.0.0
**Last Updated**: May 2026
