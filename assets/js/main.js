// IndexedDB Image Retrieval for Public Site
window.imageDB = {
  dbName: 'PakistanGovtUpdatesImages',
  storeName: 'images',
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  },
  
  async getImage(id) {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.get(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.blob) {
            const url = URL.createObjectURL(result.blob);
            resolve(url);
          } else {
            resolve(null);
          }
        };
      });
    } catch (e) {
      console.warn('IndexedDB read failed:', e);
      return null;
    }
  }
};

// Firebase Utility Functions
window.dbUtils = {
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
    if (!window.firebaseReady) {
      console.log('Firebase not configured - saving to localStorage only');
      localStorage.setItem(path, JSON.stringify(data));
      return false;
    }
    try {
      await firebase.database().ref(path).set(data);
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
      const rawData = snapshot.val();
      return this._normalizeArray(rawData) || null;
    } catch (e) {
      console.error('Firebase read error:', e);
      const cached = localStorage.getItem(path);
      return cached ? JSON.parse(cached) : null;
    }
  },
  async addMessage(message) {
    const payload = { ...message, timestamp: new Date().toISOString() };
    if (window.firebaseReady) {
      try {
        const msgs = await this.getData('messages') || [];
        msgs.push(payload);
        await this.saveData('messages', msgs);
      } catch (e) {
        console.error('Error saving message:', e);
        const messages = JSON.parse(localStorage.getItem('cms_messages') || '[]');
        messages.push(payload);
        localStorage.setItem('cms_messages', JSON.stringify(messages));
      }
    } else {
      const messages = JSON.parse(localStorage.getItem('cms_messages') || '[]');
      messages.push(payload);
      localStorage.setItem('cms_messages', JSON.stringify(messages));
    }
  }
};

// EmailJS Configuration
if (typeof emailjs !== 'undefined' && emailjs.init) {
  emailjs.init('YOUR_EMAILJS_PUBLIC_KEY'); // Replace with your actual key
} else {
  console.warn('EmailJS not loaded; contact form email functionality is disabled.');
}

// WhatsApp Configuration
const WHATSAPP_NUMBER = '+923015057401';
const WHATSAPP_MESSAGE = 'Hello! I need guidance regarding application processes.';

document.addEventListener('DOMContentLoaded',()=>{
  const jobsList=document.getElementById('jobsList');
  const schemesList=document.getElementById('schemesList');
  const scholarshipsList=document.getElementById('scholarshipsList');
  const categoryGrid=document.getElementById('categoryGrid');
  const jobsAll=document.getElementById('jobsAll');
  const schemesAll=document.getElementById('schemesAll');
  const scholarshipsAll=document.getElementById('scholarshipsAll');
  const blogList=document.getElementById('blogList');
  const filterPanel=document.getElementById('categoryFilter');
  const featuredPostsContainer=document.getElementById('featuredPosts');
  const navToggle=document.getElementById('navToggle');
  const back=document.getElementById('backToTop');
  const urlParams=new URLSearchParams(window.location.search);
  const q=urlParams.get('q')||'';
  const currentPath=window.location.pathname;
  let jobsData=[];
  let schemesData=[];
  let scholarshipsData=[];
  
  // Initialize features
  initWhatsApp();
  initSearchIndexing();

  if(navToggle){
    const navList = document.querySelector('.nav-list');
    navToggle.addEventListener('click',()=>{
      if(navList){
        navList.classList.toggle('open');
      }
    });

    if(navList){
      navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if(window.innerWidth <= 720){
            navList.classList.remove('open');
          }
        });
      });
    }
  }

  if(back){
    window.addEventListener('scroll',()=>{back.style.display=window.scrollY>280?'block':'none';});
    back.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }

  const categories=[
    {name:'FIA Jobs',anchor:'fia-jobs'},
    {name:'PPSC Jobs',anchor:'ppsc-jobs'},
    {name:'Punjab Police Jobs',anchor:'punjab-police-jobs'},
    {name:'Army / ASF / WAPDA Jobs',anchor:'army-asf-wapda-jobs'},
    {name:'NAVTTC Courses',anchor:'navttc-courses'},
    {name:'Scholarships',anchor:'scholarships'},
    {name:'BISP 8171 Scheme',anchor:'bisp-8171-scheme'},
    {name:'Apna Ghar Apni Chat Scheme',anchor:'apna-ghar-apni-chat-scheme'},
    {name:'Rashan Card / Utility Programs',anchor:'rashan-card-utility-programs'},
    {name:'Govt Announcements',anchor:'govt-announcements'}
  ];
  if(categoryGrid){categoryGrid.innerHTML=categories.map(c=>`<a class="card" href="categories.html#${c.anchor}"><h3>${c.name}</h3></a>`).join('');}
  if(filterPanel){renderCategoryButtons();}

  const coursesList=document.getElementById('coursesList');
  const coursesAll=document.getElementById('coursesAll');
  let coursesData=[];

  const loadCmsData = async (path, fallbackUrl) => {
    const cloudData = await dbUtils.getData(path);
    if (Array.isArray(cloudData) && cloudData.length > 0) {
      return cloudData;
    }
    try {
      const response = await fetch(fallbackUrl);
      return await response.json();
    } catch (error) {
      console.warn(`Unable to load ${path} from fallback`, error);
      return [];
    }
  };

  loadCmsData('cms_jobs', 'data/jobs.json').then(async data=>{
    jobsData=data;
    await renderCards(data,jobsList,'job');
    if(jobsAll) await renderCards(data,jobsAll,'job');
    if(filterPanel) applyCategoryFilter('all');
  }).catch(()=>{if(jobsList) jobsList.innerHTML='<p class="muted">Jobs unavailable</p>'});

  loadCmsData('cms_schemes', 'data/schemes.json').then(async data=>{
    schemesData=data;
    await renderCards(data,schemesList,'scheme');
    if(schemesAll) await renderCards(data,schemesAll,'scheme');
    if(filterPanel) applyCategoryFilter('all');
  }).catch(()=>{if(schemesList) schemesList.innerHTML='<p class="muted">Schemes unavailable</p>'});

  loadCmsData('cms_courses', 'data/courses.json').then(async data=>{
    coursesData=data;
    if(coursesList) await renderCards(data,coursesList,'course');
    if(coursesAll) await renderCards(data,coursesAll,'course');
    if(filterPanel) applyCategoryFilter('all');
  }).catch(()=>{if(coursesList) coursesList.innerHTML='<p class="muted">Courses unavailable</p>'});

  loadCmsData('cms_scholarships', 'data/scholarships.json').then(async data=>{
    scholarshipsData=data;
    if(scholarshipsList) await renderCards(data,scholarshipsList,'scholarship');
    if(scholarshipsAll) await renderCards(data,scholarshipsAll,'scholarship');
    if(filterPanel) applyCategoryFilter('all');
  }).catch(()=>{if(scholarshipsList) scholarshipsList.innerHTML='<p class="muted">Scholarships unavailable</p>'});

  loadCmsData('cms_posts', 'data/posts.json').then(data=>{
    renderFeaturedPosts(data);
    if(blogList) renderBlogList(data);
  }).catch(()=>{if(featuredPostsContainer) featuredPostsContainer.innerHTML='<p class="muted">Featured content unavailable.</p>'; if(blogList) blogList.innerHTML='<p class="muted">Blog posts unavailable.</p>'});

  if(currentPath.endsWith('search.html')){
    renderSearchResults(q);
  }
  if(currentPath.includes('blog/post-template.html')){
    const id=urlParams.get('id');
    if(id) loadPost(id);
  }

  const contactForm=document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit',e=>{
      e.preventDefault();
      const formData=new FormData(contactForm);
      const payload={
        name:formData.get('name'),
        email:formData.get('email'),
        subject:formData.get('subject'),
        message:formData.get('message'),
        to_email: 'junaidkhanldk@gmail.com'
      };
      
      // Save via dbUtils (Firebase + localStorage fallback)
      dbUtils.addMessage(payload);
      
      // Try to send via EmailJS if loaded
      if (typeof emailjs !== 'undefined' && typeof emailjs.send === 'function') {
        emailjs.send('service_YOUR_SERVICE', 'template_YOUR_TEMPLATE', payload)
          .then(()=>{
            showContactMessage('Message sent successfully! We will contact you soon.','success');
            contactForm.reset();
          })
          .catch(err=>{
            console.log('EmailJS error (using local/cache backup):', err);
            showContactMessage('Message received! We will contact you at ' + payload.email, 'success');
            contactForm.reset();
          });
      } else {
        showContactMessage('Message received! Contact saved locally and will be synced if Firebase is configured.','success');
        contactForm.reset();
      }
    });
  }

  function showContactMessage(message,type){
    const el=document.getElementById('contactMessage');
    if(el){el.textContent=message;el.className='form-message '+type;}
  }

  function renderCards(items,container,type){
    if(!container||!Array.isArray(items)) return;
    if(items.length===0){container.innerHTML='<p class="muted">No items found.</p>';return;}
    container.innerHTML='';
    items.slice(0,8).forEach(item=>{
      const article=document.createElement('article');
      article.className='card';
      const title=`<h3>${escapeHtml(item.title)}</h3>`;
      const meta=`<p class="muted">${item.date||''} ${item.location?`• ${escapeHtml(item.location)}`:''}</p>`;
      const excerpt=`<p>${escapeHtml(item.excerpt||item.summary||'')}</p>`;
      const actionLink=item.apply?`<a class="more-link" href="${item.apply}" target="_blank" rel="noreferrer">Apply</a>`:`<a class="more-link" href="blog/post-template.html?id=${encodeURIComponent(item.id||item.slug||item.title)}">Read</a>`;
      const readLink=`<a class="more-link" href="blog/post-template.html?id=${encodeURIComponent(item.id||item.slug||item.title)}">Details</a>`;
      article.innerHTML=title+meta+excerpt+`<p>${actionLink} ${readLink}</p>`;
      container.appendChild(article);
    });
  }

  function renderFeaturedPosts(items){
    if(!featuredPostsContainer||!Array.isArray(items)) return;
    const featured=items.slice(0,4);
    if(featured.length===0){featuredPostsContainer.innerHTML='<p class="muted">No featured guides yet.</p>';return;}
    featuredPostsContainer.innerHTML=featured.map(item=>`<article class="card"><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.date||'')}</p><p>${escapeHtml(item.excerpt||'').slice(0,160)}</p><p><a class="more-link" href="blog/post-template.html?id=${encodeURIComponent(item.id||item.slug||item.title)}">Read guide</a></p></article>`).join('');
  }

  function renderBlogList(items){
    if(!blogList||!Array.isArray(items)) return;
    if(items.length===0){blogList.innerHTML='<p class="muted">No blog posts found.</p>';return;}
    const sorted=[...items].sort((a,b)=>new Date(b.date)-new Date(a.date));
    blogList.innerHTML=sorted.map(item=>`<article class="card"><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.date||'')}</p><p>${escapeHtml(item.excerpt||item.content||'').slice(0,160)}</p><p><a class="more-link" href="blog/post-template.html?id=${encodeURIComponent(item.id||item.slug||item.title)}">Read article</a></p></article>`).join('');
  }

  function renderCategoryButtons(){
    if(!filterPanel) return;
    const buttons=['all',...categories.map(c=>c.name)];
    filterPanel.innerHTML=buttons.map(c=>`<button type="button" class="filter-btn" data-category="${c.toLowerCase()}">${c}</button>`).join('');
    filterPanel.querySelectorAll('.filter-btn').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        document.querySelectorAll('.filter-btn').forEach(el=>el.classList.remove('active'));
        btn.classList.add('active');
        await applyCategoryFilter(btn.dataset.category);
      });
    });
    const first=filterPanel.querySelector('.filter-btn');
    if(first) first.classList.add('active');
  }

  async function applyCategoryFilter(category){
    if(!jobsAll||!schemesAll) return;
    const normalized=category.toLowerCase();
    if(normalized==='all'){
      await renderCards(jobsData,jobsAll,'job');
      await renderCards(schemesData,schemesAll,'scheme');
      return;
    }
    const filteredJobs=jobsData.filter(item=>String(item.category||'').toLowerCase()===normalized);
    const filteredSchemes=schemesData.filter(item=>String(item.category||'').toLowerCase()===normalized);
    await renderCards(filteredJobs,jobsAll,'job');
    await renderCards(filteredSchemes,schemesAll,'scheme');
  }

  function renderSearchResults(query){
    const resultsEl=document.getElementById('searchResults');
    if(!resultsEl) return;
    const normalized=query.trim().toLowerCase();
    if(!normalized){resultsEl.innerHTML='<p class="muted">Enter a keyword to search jobs, schemes or guides.</p>';return;}
    Promise.all([
      loadCmsData('cms_jobs', 'data/jobs.json'),
      loadCmsData('cms_schemes', 'data/schemes.json'),
      loadCmsData('cms_posts', 'data/posts.json')
    ]).then(([jobs,schemes,posts])=>{
      const pool=[...jobs,...schemes,...posts];
      const results=pool.filter(item=>((item.title||'')+' '+(item.excerpt||'')+' '+(item.content||'')).toLowerCase().includes(normalized));
      if(results.length===0){resultsEl.innerHTML='<p class="muted">No results found.</p>';return;}
      resultsEl.innerHTML=results.map(item=>`<article class="card"><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.date||'')}</p><p>${escapeHtml((item.excerpt||item.summary||'').slice(0,160))}</p><p><a class="more-link" href="blog/post-template.html?id=${encodeURIComponent(item.id||item.slug||item.title)}">Read more</a></p></article>`).join('');
    }).catch(()=>{resultsEl.innerHTML='<p class="muted">Search service unavailable.</p>';});
  }

  async function loadPost(id){
    try {
      const [jobs,schemes,courses,scholarships,posts] = await Promise.all([
        loadCmsData('cms_jobs','../data/jobs.json'),
        loadCmsData('cms_schemes','../data/schemes.json'),
        loadCmsData('cms_courses','../data/courses.json'),
        loadCmsData('cms_scholarships','../data/scholarships.json'),
        loadCmsData('cms_posts','../data/posts.json')
      ]);
      
      const pool=[...(Array.isArray(jobs)?jobs:[]),...(Array.isArray(schemes)?schemes:[]),...(Array.isArray(courses)?courses:[]),...(Array.isArray(scholarships)?scholarships:[]),...(Array.isArray(posts)?posts:[])];
      const item=pool.find(entry=>entry.id===id||entry.slug===id||entry.title===id);
      
      if(!item){
        document.getElementById('postTitle').textContent='Content not found';
        document.getElementById('postBody').innerHTML='';
        return;
      }
      
      // Handle image retrieval from IndexedDB or fallback to data URL
      let imageUrl = null;
      let imageType = null;
      
      if (item.detailImageId) {
        imageUrl = await imageDB.getImage(item.detailImageId);
        imageType = item.detailImageType || 'image/jpeg';
      } else if (item.imageId) {
        imageUrl = await imageDB.getImage(item.imageId);
        imageType = item.imageType || 'image/jpeg';
      } else {
        imageUrl = item.detailImage || item.detailImageData || item.image || item.imageData || item.imageUrl || item.imagePath || item.image_src;
        imageType = item.detailImageType || item.imageType || 'image/jpeg';
      }
      
      // Create HTML for image or PDF
      let imageHtml = '';
      if (imageUrl) {
        if (imageType && imageType.includes('pdf')) {
          // PDF file - use embed viewer
          imageHtml = `<div class="post-file pdf-viewer"><embed src="${escapeHtml(imageUrl)}" type="application/pdf" width="100%" height="600px"></div>`;
        } else {
          // Image file - use img tag
          imageHtml = `<div class="post-image"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)}"></div>`;
        }
      }
      
      document.getElementById('postTitle').textContent=item.title;
      
      const metaParts=[];
      if(item.date) metaParts.push(item.date);
      if(item.lastDate) metaParts.push(item.lastDate);
      if(item.city) metaParts.push(item.city);
      if(item.location) metaParts.push(item.location);
      if(item.author) metaParts.push(item.author);
      document.getElementById('postMeta').textContent=metaParts.join(' • ');
      
      let bodyHtml = imageHtml;
      if(item.content){
        bodyHtml += item.content;
      } else {
        if(item.excerpt) bodyHtml += `<p>${escapeHtml(item.excerpt)}</p>`;
        if(item.eligibility) bodyHtml += `<h2>Eligibility</h2><p>${escapeHtml(item.eligibility)}</p>`;
        if(item.howToApply) bodyHtml += `<h2>How to Apply</h2><p>${escapeHtml(item.howToApply)}</p>`;
        if(item.applyProcess) bodyHtml += `<h2>Application Process</h2><p>${escapeHtml(item.applyProcess)}</p>`;
        if(item.process) bodyHtml += `<h2>Registration Process</h2><p>${escapeHtml(item.process)}</p>`;
        if(item.benefits) bodyHtml += `<h2>Benefits</h2><p>${escapeHtml(item.benefits)}</p>`;
        if(item.institute) bodyHtml += `<h2>Institute</h2><p>${escapeHtml(item.institute)}</p>`;
        if(item.duration) bodyHtml += `<h2>Duration</h2><p>${escapeHtml(item.duration)}</p>`;
        if(item.country) bodyHtml += `<h2>Country</h2><p>${escapeHtml(item.country)}</p>`;
        if(item.documents && Array.isArray(item.documents)) {
          bodyHtml += `<h2>Required Documents</h2><ul>${item.documents.map(doc=>`<li>${escapeHtml(doc)}</li>`).join('')}</ul>`;
        }
        if(item.applyLink || item.link || item.apply) {
          bodyHtml += `<p><a class="more-link" href="${item.applyLink||item.link||item.apply}" target="_blank" rel="noreferrer">Go to Official Link</a></p>`;
        }
      }
      document.getElementById('postBody').innerHTML=bodyHtml;
      
      const schema={"@context":"https://schema.org","@type":"Article","headline":item.title,"datePublished":item.date||item.publishDate||new Date().toISOString(),"author":{"@type":"Person","name":item.author||'PakistanGovtUpdates'}};
      const schemaEl=document.getElementById('postSchema');
      if(schemaEl) schemaEl.textContent=JSON.stringify(schema);
    } catch(error) {
      console.error('Error loading post:', error);
      document.getElementById('postTitle').textContent='Unable to load content.';
      document.getElementById('postBody').innerHTML='';
    }
  }

  function escapeHtml(text){
    return String(text||'').replace(/[&<>\"]/g,entity=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[entity]));
  }

  // WhatsApp Integration
  function initWhatsApp() {
    const whatsappBtn = document.querySelector('.whatsapp-float a');
    if(whatsappBtn) {
      whatsappBtn.href = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
      whatsappBtn.target = '_blank';
      whatsappBtn.rel = 'noopener noreferrer';
    }
  }

  // Search Indexing
  function initSearchIndexing() {
    window.searchIndex = {
      jobs: [],
      schemes: [],
      posts: []
    };
    
    // Index jobs
    fetch('data/jobs.json').then(r=>r.json()).then(data=>{
      window.searchIndex.jobs = data || [];
    }).catch(e=>console.log('Jobs indexing failed'));
    
    // Index schemes
    fetch('data/schemes.json').then(r=>r.json()).then(data=>{
      window.searchIndex.schemes = data || [];
    }).catch(e=>console.log('Schemes indexing failed'));
    
    // Index posts
    fetch('data/posts.json').then(r=>r.json()).then(data=>{
      window.searchIndex.posts = data || [];
    }).catch(e=>console.log('Posts indexing failed'));
  }

  // SEO Schema Markup
  function addSchemaMarkup(item, type) {
    let schema = {
      '@context': 'https://schema.org',
      '@type': type === 'job' ? 'JobPosting' : 'BreadcrumbList',
      'name': item.title,
      'description': item.excerpt || item.eligibility || '',
      'datePosted': item.publishDate || new Date().toISOString(),
      'url': window.location.href
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  // Generate SEO Meta Tags
  function generateSEOTags(item) {
    if(!item) return;
    
    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if(metaDesc) metaDesc.content = item.seoDescription || item.excerpt || '';
    
    // OG tags
    document.querySelector('meta[property="og:title"]').content = item.seoTitle || item.title;
    document.querySelector('meta[property="og:description"]').content = item.seoDescription || item.excerpt || '';
    document.querySelector('meta[property="og:image"]').content = item.image || 'assets/images/logo.svg';
    
    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if(canonical) canonical.href = window.location.href;
  }

  // Enhanced renderCards with SEO
  async function renderCards(items,container,type){
    if(!container||!Array.isArray(items)) return;
    if(items.length===0){container.innerHTML='<p class="muted">No items found.</p>';return;}
    container.innerHTML='';
    const limit = container.id.includes('All') ? items.length : 8;
    
    for (const item of items.slice(0, limit)) {
      // Get image URL - check IndexedDB first for imageId, then fallback to existing formats
      let imageUrl = null;
      if (item.imageId) {
        imageUrl = await imageDB.getImage(item.imageId);
      } else {
        imageUrl = item.image || item.imageData || item.imageUrl || item.imagePath || item.image_src;
      }
      
      const article=document.createElement('article');
      article.className = imageUrl ? 'card card-has-image' : 'card';
      const title=`<h3>${escapeHtml(item.title)}</h3>`;
      const imageHtml = imageUrl ? `<div class="card-image"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)}"></div>` : '';
      const meta=`<p class="muted">${item.lastDate ? new Date(item.lastDate).toLocaleDateString() : (item.publishDate ? new Date(item.publishDate).toLocaleDateString() : '')} ${item.city||item.location?`• ${escapeHtml(item.city||item.location)}`:''}</p>`;
      const excerpt=`<p>${escapeHtml(item.excerpt||item.eligibility||item.summary||item.description||'')}</p>`;
      const buttons = [];
      if(item.applyLink || item.link || item.apply) {
        buttons.push(`<a class="more-link" href="${item.applyLink || item.link || item.apply}" target="_blank" rel="noreferrer">🔗 Official Link</a>`);
      }
      buttons.push(`<a class="more-link" href="blog/post-template.html?id=${encodeURIComponent(item.slug || item.id || item.title)}">📖 Details</a>`);
      const btnHtml = buttons.join(' ');
      article.innerHTML=`${imageHtml}<div class="card-body"><div>${title}${meta}${excerpt}</div><p>${btnHtml}</p></div>`;
      container.appendChild(article);
    }
  }
});

