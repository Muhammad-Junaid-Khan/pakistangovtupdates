// Admin Dashboard JavaScript
// CMS System for Pakistan Govt Updates

// Firebase Utility for Admin Panel
window.adminDB = {
  _getLocalKey(path) {
    return path === 'messages' ? 'cms_messages' : path;
  },

  _normalizeArray(data) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      const keys = Object.keys(data);
      const numericKeys = keys.filter(k => /^\d+$/.test(k));
      if (numericKeys.length === keys.length && keys.length > 0) {
        return numericKeys
          .sort((a, b) => Number(a) - Number(b))
          .map(key => data[key]);
      }
    }
    return data;
  },

  async saveData(path, data) {
    const localKey = this._getLocalKey(path);
    if (!window.firebaseReady) {
      console.log('Firebase not configured - saving to localStorage only');
      localStorage.setItem(localKey, JSON.stringify(data));
      return false;
    }
    try {
      await firebase.database().ref(path).set(data);
      localStorage.setItem(localKey, JSON.stringify(data));
      console.log('✅ Saved to Firebase:', path);
      return true;
    } catch (e) {
      console.error('Firebase save error:', e);
      localStorage.setItem(localKey, JSON.stringify(data));
      return false;
    }
  },

  getData(path) {
    const localKey = this._getLocalKey(path);
    if (!window.firebaseReady) {
      const cached = localStorage.getItem(localKey);
      return Promise.resolve(cached ? JSON.parse(cached) : null);
    }
    return new Promise((resolve) => {
      firebase.database().ref(path).once('value')
        .then((snapshot) => {
          const rawData = snapshot.val();
          const data = this._normalizeArray(rawData);
          if (data) {
            localStorage.setItem(localKey, JSON.stringify(data));
            resolve(data);
          } else {
            const cached = localStorage.getItem(localKey);
            resolve(cached ? JSON.parse(cached) : null);
          }
        })
        .catch((e) => {
          console.warn('Firebase read fallback to localStorage:', path);
          const cached = localStorage.getItem(localKey);
          resolve(cached ? JSON.parse(cached) : null);
        });
    });
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
      posts: [],
      media: []
    };
    this.init();
  }

  async init() {
    this.wrapper = document.getElementById('adminWrapper');
    this.checkAuth();
    this.setupEventListeners();
    await this.loadAllData();
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

    if (mobileMenuToggle && sidebar) {
      mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

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

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('cms_auth');
      location.reload();
    });

    document.getElementById('themeToggle').addEventListener('click', () => {
      document.documentElement.style.colorScheme =
        document.documentElement.style.colorScheme === 'dark' ? 'light' : 'dark';
    });

    document.getElementById('globalSearch').addEventListener('input', (e) => {
      this.globalSearch(e.target.value);
    });

    document.getElementById('mediaFile').addEventListener('change', (e) => {
      this.handleMediaUpload(e);
    });

    document.querySelectorAll('.file-upload').forEach(upload => {
      const input = upload.querySelector('input[type="file"]');
      if (!input) return;

      // Make the visible upload box trigger the hidden file input.
      upload.addEventListener('click', () => input.click());

      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        let fileName = upload.querySelector('.file-name');
        if (!fileName) {
          fileName = document.createElement('p');
          fileName.className = 'file-name';
          upload.appendChild(fileName);
        }
        fileName.textContent = file ? `Selected file: ${file.name}` : 'Upload file';
      });
    });
  }

  switchSection(section) {
    document.querySelectorAll('.content-section').forEach(s => {
      s.classList.remove('active');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    const sectionEl = document.getElementById(section + '-content');
    if (sectionEl) {
      sectionEl.classList.add('active');
    }

    const navItem = document.querySelector(`[data-section="${section}"]`);
    if (navItem) navItem.classList.add('active');

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

    const data = {};
    const filePromises = [];

    for (const [key, value] of formData.entries()) {
      const normalizedKey = key.endsWith('[]') ? key.slice(0, -2) : key;

      if (value instanceof File && value.name) {
        const promise = this.readFileAsDataURL(value).then((dataUrl) => {
          data[`${normalizedKey}Name`] = value.name;
          if (dataUrl) {
            data[`${normalizedKey}Data`] = dataUrl;
            data[normalizedKey] = dataUrl;
          }
        });
        filePromises.push(promise);
      } else if (key.endsWith('[]')) {
        data[normalizedKey] = Array.isArray(data[normalizedKey]) ? data[normalizedKey] : [];
        data[normalizedKey].push(value);
      } else {
        data[normalizedKey] = value;
      }
    }

    await Promise.all(filePromises);

    data.slug = this.generateSlug(data.title);
    data.publishDate = new Date().toISOString();
    data.id = Date.now().toString();

    this.data[type + 's'].push(data);

    const saved = await adminDB.saveData('cms_' + type + 's', this.data[type + 's']);

    if (saved) {
      this.showToast(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} published to Firebase!`, 'success');
    } else {
      this.showToast(`💾 ${type.charAt(0).toUpperCase() + type.slice(1)} saved locally!`, 'success');
    }

    form.reset();
    this.loadContentList(type);
    this.renderPreview();
    await this.updateStats();
  }

  async readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Unable to read file'));
      reader.readAsDataURL(file);
    });
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

  getContentListId(type) {
    return `${type}sList`;
  }

  loadContentList(type) {
    const listId = this.getContentListId(type);
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

  renderPreview() {
    const previewContainer = document.getElementById('previewList');
    if (!previewContainer) return;

    const previewItems = [
      ...this.data.jobs.map(item => ({ ...item, type: 'Job' })),
      ...this.data.schemes.map(item => ({ ...item, type: 'Scheme' })),
      ...this.data.courses.map(item => ({ ...item, type: 'Course' })),
      ...this.data.scholarships.map(item => ({ ...item, type: 'Scholarship' })),
      ...this.data.posts.map(item => ({ ...item, type: 'Post' }))
    ]
      .filter(item => item && item.title)
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      .slice(0, 5);

    if (previewItems.length === 0) {
      previewContainer.innerHTML = '<p class="muted">No preview items yet.</p>';
      return;
    }

    previewContainer.innerHTML = previewItems.map(item => `
      <div class="preview-item">
        <strong>${item.title}</strong>
        <p class="muted">${item.type} • ${item.publishDate ? new Date(item.publishDate).toLocaleDateString() : 'No date'}</p>
      </div>
    `).join('');
  }

  editItem(type, index) {
    const item = this.data[type + 's'][index];
    const formId = type + 'Form';
    const form = document.getElementById(formId);

    if (Array.isArray(item.documents)) {
      const listId = type === 'job' ? 'docsList' : type === 'scheme' ? 'schemeDocs' : type === 'scholarship' ? 'scholarshipDocs' : null;
      if (listId) {
        const list = document.getElementById(listId);
        list.innerHTML = '';
        item.documents.forEach((doc) => {
          const input = document.createElement('input');
          input.type = 'text';
          input.name = 'documents[]';
          input.className = 'doc-input';
          input.value = doc || '';
          list.appendChild(input);
        });
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'add-btn';
        addBtn.textContent = '+ Add';
        addBtn.onclick = () => {
          if (type === 'job') addDocumentField();
          if (type === 'scheme') addSchemeDocField();
          if (type === 'scholarship') addScholarshipDocField();
        };
        list.appendChild(addBtn);
      }
    }

    Object.keys(item).forEach(key => {
      if (key === 'documents') return;
      const field = form.elements[key];
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = item[key];
        } else if (field.length && field.length > 0) {
          field[0].value = item[key];
        } else {
          field.value = item[key];
        }
      }
    });

    this.switchSection(type + 's');
    this.showToast('Edit mode - Make changes and click Publish to update', 'warn');
  }

  async deleteItem(type, index) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.data[type + 's'].splice(index, 1);
      await adminDB.saveData('cms_' + type + 's', this.data[type + 's']);
      this.loadContentList(type);
      this.renderPreview();
      await this.updateStats();
      this.showToast('Item deleted successfully', 'success');
    }
  }

  async loadAllData() {
    for (const key of Object.keys(this.data)) {
      try {
        const fbData = await adminDB.getData('cms_' + key);
        if (fbData && Array.isArray(fbData)) {
          this.data[key] = fbData;
        } else {
          const stored = localStorage.getItem('cms_' + key);
          if (stored) {
            this.data[key] = JSON.parse(stored);
          }
        }
      } catch (e) {
        const stored = localStorage.getItem('cms_' + key);
        if (stored) {
          this.data[key] = JSON.parse(stored);
        }
      }
    }

    this.loadContentList('job');
    this.loadContentList('scheme');
    this.loadContentList('course');
    this.loadContentList('scholarship');
    this.loadContentList('post');

    await this.loadMessages();
    this.renderPreview();
    this.renderMediaGallery();
    await this.updateStats();
  }

  async updateStats() {
    document.getElementById('totalJobs').textContent = this.data.jobs.length;
    document.getElementById('totalSchemes').textContent = this.data.schemes.length;
    document.getElementById('totalPosts').textContent = this.data.posts.length;
    document.getElementById('totalMessages').textContent = await this.getMessageCount();

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
    this.renderPreview();
    await this.updateStats();
  }

  initCharts() {
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
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

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
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }

  async handleMediaUpload(e) {
    const files = Array.from(e.target.files || []);
    const gallery = document.getElementById('mediaGallery');

    for (const file of files) {
      const dataUrl = await this.readFileAsDataURL(file);
      const itemData = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl
      };
      this.data.media.push(itemData);
      await adminDB.saveData('cms_media', this.data.media);

      const item = document.createElement('div');
      item.className = 'media-item';
      item.dataset.mediaId = itemData.id;
      item.innerHTML = `
        <img src="${dataUrl}" alt="${file.name}">
        <div class="media-item-actions">
          <button type="button" onclick="cms.copyMediaUrl('${itemData.id}')">📋 Copy</button>
          <button type="button" onclick="cms.deleteMedia(this)">🗑️ Delete</button>
        </div>
      `;
      gallery.appendChild(item);
    }

    this.renderMediaGallery();
    this.showToast(`Uploaded ${files.length} media file(s)`, 'success');
  }

  copyMediaUrl(id) {
    const item = this.data.media.find(media => media.id === id);
    if (item?.dataUrl) {
      navigator.clipboard.writeText(item.dataUrl);
      this.showToast('Media URL copied to clipboard', 'success');
    } else {
      this.showToast('Media URL not available', 'error');
    }
  }

  renderMediaGallery() {
    const gallery = document.getElementById('mediaGallery');
    if (!gallery) return;
    gallery.innerHTML = '';

    this.data.media.forEach(itemData => {
      const item = document.createElement('div');
      item.className = 'media-item';
      item.dataset.mediaId = itemData.id;
      item.innerHTML = `
        <img src="${itemData.dataUrl}" alt="${itemData.name}">
        <div class="media-item-actions">
          <button type="button" onclick="cms.copyMediaUrl('${itemData.id}')">📋 Copy</button>
          <button type="button" onclick="cms.deleteMedia(this)">🗑️ Delete</button>
        </div>
      `;
      gallery.appendChild(item);
    });
  }

  async deleteMedia(btn) {
    const item = btn.closest('.media-item');
    const id = item?.dataset?.mediaId;
    if (id) {
      this.data.media = this.data.media.filter(media => media.id !== id);
      await adminDB.saveData('cms_media', this.data.media);
    }
    if (item) item.remove();
    this.renderMediaGallery();
    this.showToast('Media deleted', 'success');
  }

  globalSearch(query) {
    if (!query) return;
    const results = [];

    Object.values(this.data).forEach(collection => {
      collection.forEach(item => {
        const haystack = `${item.title || ''} ${item.description || ''} ${item.excerpt || ''} ${item.category || ''}`.toLowerCase();
        if (haystack.includes(query.toLowerCase())) {
          results.push(item);
        }
      });
    });

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
  input.name = 'documents[]';
  input.className = 'doc-input';
  input.placeholder = 'Add document';
  list.insertBefore(input, list.querySelector('.add-btn'));
}

function addSchemeDocField() {
  const list = document.getElementById('schemeDocs');
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'documents[]';
  input.className = 'doc-input';
  input.placeholder = 'Add document';
  list.insertBefore(input, list.querySelector('.add-btn'));
}

function addScholarshipDocField() {
  const list = document.getElementById('scholarshipDocs');
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'documents[]';
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