# Firebase Setup Guide for Pakistan Government Updates

This guide will help you set up Firebase Realtime Database for cross-device data persistence, enabling your admin panel to save jobs, schemes, and contact messages across all devices.

## Why Firebase?

Your website is hosted on GitHub Pages (static hosting), which cannot save data to files. Firebase provides a cloud database that:
- ✅ Persists admin panel data (jobs, schemes, courses, scholarships, posts)
- ✅ Shares contact form messages across all admin devices
- ✅ Works with your static GitHub Pages + Cloudflare setup
- ✅ Is free for small projects (Spark plan)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `pakistangovjobs` (or any name you prefer)
4. Click **Continue**
5. Disable Google Analytics (optional) → Click **Create project**
6. Wait for project to be created (30-60 seconds)

## Step 2: Enable Realtime Database

1. In Firebase Console, go to **Build** → **Realtime Database**
2. Click **Create Database**
3. Select location closest to your users (e.g., `Asia Pacific - Singapore` or `Asia Southeast - Singapore`)
4. Click **Next**
5. Choose **Start in test mode** (we'll set security rules later)
6. Click **Enable**

> ⚠️ **Important**: Test mode allows anyone to read/write. We'll secure this in Step 5.

## Step 3: Get Your Credentials

1. In Firebase Console, click the **Settings icon** ⚙️ (top-left)
2. Go to **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web icon** (if not already added)
5. Choose a name like `Pakistan Govt Updates` → Click **Register app**
6. Copy the configuration code. It looks like:

```javascript
const firebaseConfig = {git push -u origin main
  apiKey: "AIzaSy...",
  authDomain: "pakistangovjobs.firebaseapp.com",
  databaseURL: "https://pakistangovjobs-default-rtdb.firebaseio.com",
  projectId: "pakistangovjobs",
  storageBucket: "pakistangovjobs.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## Step 4: Update Your Project

1. Open `admin/index.html` in your code editor
2. Find this section:

```html
<!-- Firebase Configuration - UPDATE WITH YOUR CONFIG -->
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey123456789",
  authDomain: "pakistangovjobs.firebaseapp.com",
  ...
};
```

3. **Replace ONLY the values** with your credentials from Step 3
4. Save the file
5. Commit and push to GitHub:

```bash
git add admin/index.html
git commit -m "Update Firebase credentials"
git push
```

## Step 5: Set Security Rules (Optional but Recommended)

To protect your database, set these rules:

1. In Firebase Console → **Realtime Database**
2. Go to **Rules** tab
3. Replace the entire rules with:

```json
{
  "rules": {
    "cms_jobs": {
      ".read": true,
      ".write": false
    },
    "cms_schemes": {
      ".read": true,
      ".write": false
    },
    "cms_posts": {
      ".read": true,
      ".write": false
    },
    "messages": {
      ".read": "root.child('admin_token').exists()",
      ".write": true
    },
    ".read": false,
    ".write": false
  }
}
```

4. Click **Publish**

## Step 6: Test Your Setup

1. Visit your admin panel: `https://yourdomain.com/admin/`
2. Log in with password: `admin123`
3. Add a test job/scheme
4. Refresh the page → Data should persist
5. Open admin on a different browser/device
6. Your new job/scheme should appear

## What's Now Persisted in Firebase?

| Data | Location | Purpose |
|------|----------|---------|
| Jobs | `cms_jobs` | Job listings created via admin panel |
| Schemes | `cms_schemes` | Government schemes |
| Courses | `cms_courses` | NAVTTC courses |
| Scholarships | `cms_scholarships` | Scholarship opportunities |
| Posts | `cms_posts` | Blog posts and guides |
| Messages | `messages` | Contact form submissions |

## Offline Support

The app will still work offline! Data is cached locally and synced to Firebase when you're back online.

## Troubleshooting

### "Firebase not configured" message in console

- **Issue**: Firebase credentials are placeholder values
- **Solution**: Follow Step 4 above to update credentials

### Can't see Firebase data in admin panel

- **Issue**: Using old browser/cached page
- **Solution**: Clear browser cache and hard-refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### Firebase Storage CORS blocked

- **Issue**: Uploads to Firebase Storage fail from your deployed origin
- **Solution**: Configure your storage bucket CORS policy to allow requests from `https://pakistangovtupdates.pages.dev` or your site origin.

### Database size limit exceeded

- **Issue**: Firebase Spark plan has limits
- **Solution**: Upgrade to Blaze plan (pay-as-you-go) for larger data

### Data not syncing across devices

- **Issue**: Different user accounts or browser storage cleared
- **Solution**: Admin uses same password (`admin123`). Clear localStorage if needed: 
  - Open browser DevTools → Application → LocalStorage → Delete `cms_*` entries

## Next Steps

- [ ] Create Firebase project
- [ ] Enable Realtime Database
- [ ] Get and update credentials in `admin/index.html`
- [ ] Test on admin panel
- [ ] Test on different device
- [ ] Set security rules

## Support

If Firebase doesn't work or you need help, check:
- Firebase Console → Realtime Database → **Realtime Database** tab for data viewer
- Browser DevTools Console (F12) for error messages
- GitHub repository issues

---

**Need an alternative?** If you prefer not to use Firebase, alternatives include:
- Supabase (PostgreSQL-based)
- Firebase Firestore (document database)
- AWS Amplify
- Azure Functions
