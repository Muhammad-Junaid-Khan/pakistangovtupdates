// Admin Dashboard JavaScript
// CMS System for Pakistan Govt Updates

// Firebase Utility for Admin Panel
window.adminDB = {
  async saveData(path, data) {
    if (!window.firebaseReady) {
      console.log('Firebase not configured - saving to localStorage only');
      localStorage.setItem(path, JSON.stringify(data));
      return false;
    }
    try {
      await firebase.database().ref(path).set(data);
      localStorage.setItem(path, JSON.stringify(data)); // Also backup locally
      return true;
    } catch (e) {
      console.error('Firebase save error:', e);
      localStorage.setItem(path, JSON.stringify(data));
      return false;
    }
  },
  async getData(path) {
    if (!window.firebaseReady) {
      const cached = localStorage.getItem(path);
      return cached ? JSON.parse(cached) : null;
    }
    try {
      const snapshot = await firebase.database().ref(path).get();
      const data = snapshot.val();
      if (data) localStorage.setItem(path, JSON.stringify(data)); // Update cache
      return data || null;
    } catch (e) {
      console.error('Firebase read error:', e);
      const cached = localStorage.getItem(path);
      return cached ? JSON.parse(cached) : null;
    }
  }
};

class AdminCMS {
  constructor() {
    this.user = null;
    this.wrapper = null;
    this.adminPassword = 'admin123';
    this.data = {
      jobs: [],
      schemes: [],
      courses: [],
      scholarships: [],
      posts: []
    };
    this.init();
  }

  async init() {
    this.wrapper = document.getElementById('adminWrapper');
    this.checkAuth();
    this.setupEventListeners();
    this.loadAllData();
    this.initCharts();
  }

  checkAuth() {
    const auth = localStorage.getItem('cms_auth');
    if (!auth) {
      this.hideInterface();
      this.showAuthModal();
    } else {
      this.user = JSON.parse(auth);
      document.getElementById('userDisplay').textContent = this.user.name || 'Admin';
      this.showInterface();
    }
  }

  hideInterface() {
    if (this.wrapper) {
      this.wrapper.classList.add('hidden');
      this.wrapper.classList.remove('show');
    }
  }

  showInterface() {
    if (this.wrapper) {
      this.wrapper.classList.remove('hidden');
      this.wrapper.classList.add('show');
    }
  }

  showAuthModal() {
    const modal = document.getElementById('authModal');
    const btn = document.getElementById('githubAuthBtn');
    const passwordInput = document.getElementById('adminPasswordInput');
    modal.classList.add('show');
    
    btn.addEventListener('click', () => {
      if (!passwordInput || passwordInput.value.trim() !== this.adminPassword) {
        this.showToast('Invalid password. Please enter the admin password.', 'error');
        return;
      }

      // Simulate GitHub OAuth
      const mockUser = {
        name: 'Admin User',
        email: 'admin@example.com',
        token: 'github_token_' + Math.random().toString(36).substr(2, 9)
      };
      localStorage.setItem('cms_auth', JSON.stringify(mockUser));
      this.user = mockUser;
      document.getElementById('userDisplay').textContent = mockUser.name;
      modal.classList.remove('show');
      passwordInput.value = '';
      this.showInterface();
    });
  }

  setupEventListeners() {
    const sidebar = document.querySelector('.admin-sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');

    // Mobile menu toggle
    if (mobileMenuToggle && sidebar) {
      mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.switchSection(section);

        if (window.innerWidth <= 768 && sidebar) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Forms
    document.getElementById('jobForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitForm('job');
    });

    document.getElementById('schemeForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitForm('scheme');
    });

    document.getElementById('courseForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitForm('course');
    });

    document.getElementById('scholarshipForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitForm('scholarship');
    });

    document.getElementById('postForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitForm('post');
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('cms_auth');
      location.reload();
    });

    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      document.documentElement.style.colorScheme = 
        document.documentElement.style.colorScheme === 'dark' ? 'light' : 'dark';
    });

    // Global Search
    document.getElementById('globalSearch').addEventListener('input', (e) => {
      this.globalSearch(e.target.value);
    });

    // Media Upload
    document.getElementById('mediaFile').addEventListener('change', (e) => {
      this.handleMediaUpload(e);
    });
  }

  switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => {
      s.classList.remove('active');
    });

    // Remove active from nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Show selected section
    const sectionEl = document.getElementById(section + '-content');
    if (sectionEl) {
      sectionEl.classList.add('active');
    }

    // Set active nav item
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update page title
    const titles = {
      dashboard: '📊 Dashboard',
      jobs: '💼 Add Government Job',
      schemes: '🏛️ Add Government Scheme',
      courses: '📚 Add NAVTTC Course',
      scholarships: '🎓 Add Scholarship',
      posts: '📰 Add Government Update',
      media: '📸 Media Upload',
      seo: '🔍 SEO Settings',
      messages: '💬 Contact Messages',
      analytics: '📊 Analytics Overview'
    };

    document.getElementById('pageTitle').textContent = titles[section] || section;
    document.getElementById('breadcrumb').textContent = section.charAt(0).toUpperCase() + section.slice(1);
  }

  async submitForm(type) {
    const formId = type + 'Form';
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    
    // Convert to object
    const data = Object.fromEntries(formData);
    
    // Generate slug
    data.slug = this.generateSlug(data.title);
    
    // Add timestamp
    data.publishDate = new Date().toISOString();
    
    // Add to data
    this.data[type + 's'].push(data);
    
    // Save via Firebase + localStorage
    await adminDB.saveData('cms_' + type + 's', this.data[type + 's']);
    
    // Show success message
    this.showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} published successfully!`, 'success');
    
    // Reset form
    form.reset();
    
    // Reload list
    this.loadContentList(type);
    await this.updateStats();
  }

  async saveToJSON(type, data) {
    try {
      // Save via Firebase + localStorage
      await adminDB.saveData('cms_' + type, data);
      console.log(`Saved ${type} to Firebase and localStorage`);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  generateSlug(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  loadContentList(type) {
    const listId = type + 'List';
    const container = document.getElementById(listId);
    if (!container) return;

    const items = this.data[type + 's'] || [];
    
    if (items.length === 0) {
      container.innerHTML = '<p class="muted">No ' + type + 's published yet.</p>';
      return;
    }

    container.innerHTML = items.map((item, i) => `
      <div class="list-item">
        <div class="list-item-content">
          <h4>${item.title}</h4>
          <p>${item.publishDate ? new Date(item.publishDate).toLocaleDateString() : 'Not dated'}</p>
        </div>
        <div class="list-item-actions">
          <button class="edit-btn" onclick="cms.editItem('${type}', ${i})">✏️ Edit</button>
          <button class="delete-btn" onclick="cms.deleteItem('${type}', ${i})">🗑️ Delete</button>
        </div>
      </div>
    `).join('');
  }

  editItem(type, index) {
    const item = this.data[type + 's'][index];
    const formId = type + 'Form';
    const form = document.getElementById(formId);
    
    // Populate form with item data
    Object.keys(item).forEach(key => {
      const field = form.elements[key];
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = item[key];
        } else {
          field.value = item[key];
        }
      }
    });

    this.switchSection(type);
    this.showToast('Edit mode - Make changes and click Publish to update', 'warn');
  }

  async deleteItem(type, index) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.data[type + 's'].splice(index, 1);
      await adminDB.saveData('cms_' + type + 's', this.data[type + 's']);
      this.loadContentList(type);
      await this.updateStats();
      this.showToast('Item deleted successfully', 'success');
    }
  }

  async loadAllData() {
    // Load from Firebase first (if configured), then fall back to localStorage
    for (const key of Object.keys(this.data)) {
      const fbData = await adminDB.getData('cms_' + key);
      if (fbData && Array.isArray(fbData)) {
        this.data[key] = fbData;
      } else {
        // Fall back to localStorage
        const stored = localStorage.getItem('cms_' + key);
        if (stored) {
          this.data[key] = JSON.parse(stored);
        }
      }
    }

    // Try to load from JSON files as additional source
    try {
      const responses = await Promise.all([
        fetch('/data/jobs.json'),
        fetch('/data/schemes.json'),
        fetch('/data/posts.json')
      ]);

      const jsons = await Promise.all(responses.map(r => r.json().catch(() => [])));
      if (jsons[0]?.length > 0) this.data.jobs = jsons[0];
      if (jsons[1]?.length > 0) this.data.schemes = jsons[1];
      if (jsons[2]?.length > 0) this.data.posts = jsons[2];
    } catch (error) {
      console.log('Using localStorage data');
    }

    // Load content lists
    this.loadContentList('job');
    this.loadContentList('scheme');
    this.loadContentList('course');
    this.loadContentList('scholarship');
    this.loadContentList('post');

    // Load messages and update stats
    await this.loadMessages();
    await this.updateStats();
  }

  async updateStats() {
    document.getElementById('totalJobs').textContent = this.data.jobs.length;
    document.getElementById('totalSchemes').textContent = this.data.schemes.length;
    document.getElementById('totalPosts').textContent = this.data.posts.length;
    document.getElementById('totalMessages').textContent = await this.getMessageCount();
    
    // Update recent activity
    const recent = document.getElementById('recentList');
    const allItems = [
      ...this.data.jobs.map(j => ({ ...j, type: 'job' })),
      ...this.data.schemes.map(s => ({ ...s, type: 'scheme' })),
      ...this.data.posts.map(p => ({ ...p, type: 'post' }))
    ].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)).slice(0, 5);

    if (allItems.length === 0) {
      recent.innerHTML = '<p class="muted">No recent items</p>';
      return;
    }

    recent.innerHTML = allItems.map(item => `
      <div class="activity-item">
        <strong>${item.title}</strong>
        <p>${item.type.toUpperCase()} • ${new Date(item.publishDate).toLocaleDateString()}</p>
      </div>
    `).join('');
  }

  async getMessageCount() {
    const messages = await adminDB.getData('messages') || [];
    return Array.isArray(messages) ? messages.length : 0;
  }

  async loadMessages() {
    const list = document.getElementById('messagesList');
    const messages = await adminDB.getData('messages') || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      list.innerHTML = '<p class="muted">No messages yet</p>';
      return;
    }

    list.innerHTML = messages.map((msg, i) => `
      <div class="message-item">
        <div class="message-header">
          <strong>${msg.name}</strong>
          <span class="message-time">${new Date(msg.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="message-email">${msg.email}</div>
        <div class="message-content">
          <strong>Subject:</strong> ${msg.subject}<br>
          ${msg.message}
        </div>
        <button class="delete-btn" onclick="cms.deleteMessage(${i})" style="padding: 0.5rem 1rem; margin-top: 0.75rem;">🗑️ Delete</button>
      </div>
    `).join('');
  }

  async deleteMessage(index) {
    const messages = (await adminDB.getData('messages') || []).filter((_, i) => i !== index);
    await adminDB.saveData('messages', messages);
    await this.loadMessages();
    await this.updateStats();
  }

  initCharts() {
    // Content Distribution Chart
    const ctx1 = document.getElementById('contentChart')?.getContext('2d');
    if (ctx1) {
      new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Jobs', 'Schemes', 'Courses', 'Scholarships', 'Posts'],
          datasets: [{
            data: [
              this.data.jobs.length,
              this.data.schemes.length,
              this.data.courses.length,
              this.data.scholarships.length,
              this.data.posts.length
            ],
            backgroundColor: ['#0a66c2', '#0066a1', '#004d7a', '#003a5c', '#00273f'],
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Publishing Trend Chart
    const ctx2 = document.getElementById('publishChart')?.getContext('2d');
    if (ctx2) {
      new Chart(ctx2, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Published Items',
            data: [5, 8, 6, 12, 15, 20],
            borderColor: '#0a66c2',
            backgroundColor: 'rgba(10, 102, 194, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: true }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }

  handleMediaUpload(e) {
    const files = e.target.files;
    const gallery = document.getElementById('mediaGallery');
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const item = document.createElement('div');
        item.className = 'media-item';
        item.innerHTML = `
          <img src="${event.target.result}" alt="${file.name}">
          <div class="media-item-actions">
            <button onclick="cms.copyMediaUrl('${event.target.result}')">📋 Copy</button>
            <button onclick="cms.deleteMedia(this)">🗑️ Delete</button>
          </div>
        `;
        gallery.appendChild(item);
      };
      reader.readAsDataURL(file);
    });

    this.showToast(`Uploaded ${files.length} media file(s)`, 'success');
  }

  copyMediaUrl(url) {
    navigator.clipboard.writeText(url);
    this.showToast('Media URL copied to clipboard', 'success');
  }

  deleteMedia(btn) {
    btn.closest('.media-item').remove();
    this.showToast('Media deleted', 'success');
  }

  globalSearch(query) {
    if (!query) return;
    const results = [];

    // Search in all data
    Object.values(this.data).forEach(collection => {
      collection.forEach(item => {
        if (item.title?.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase())) {
          results.push(item);
        }
      });
    });

    console.log(`Found ${results.length} results for "${query}"`);
    this.showToast(`Found ${results.length} results for "${query}"`, 'success');
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Helper Functions
function addDocumentField() {
  const list = document.getElementById('docsList');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'doc-input';
  input.placeholder = 'Add document';
  list.insertBefore(input, list.querySelector('.add-btn'));
}

function addSchemeDocField() {
  const list = document.getElementById('schemeDocs');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'doc-input';
  input.placeholder = 'Add document';
  list.insertBefore(input, list.querySelector('.add-btn'));
}

function addScholarshipDocField() {
  const list = document.getElementById('scholarshipDocs');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'doc-input';
  input.placeholder = 'Add document';
  list.insertBefore(input, list.querySelector('.add-btn'));
}

function saveSEOSettings() {
  const settings = {
    siteTitle: document.getElementById('siteTitle').value,
    siteDesc: document.getElementById('siteDesc').value,
    focusKeywords: document.getElementById('focusKeywords').value,
    gaId: document.getElementById('gaId').value,
    adsenseId: document.getElementById('adsenseId').value
  };

  localStorage.setItem('cms_seo_settings', JSON.stringify(settings));
  cms.showToast('SEO settings saved successfully!', 'success');
}

// Initialize CMS
const cms = new AdminCMS();
