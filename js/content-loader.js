(function () {
    let loadedContent = null;

    async function loadContent() {
      try {
        const response = await fetch('data/content.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const content = await response.json();
        loadedContent = content;
        bindContent(content);
        window.siteContent = content;
        document.documentElement.classList.add('content-loaded');
        document.dispatchEvent(new CustomEvent('content:loaded', { detail: content }));
      } catch (error) {
        console.warn('Falha ao carregar data/content.json. Mantendo fallback hardcoded.', error);
        document.documentElement.classList.add('content-fallback');
      }
    }

    function bindContent(content) {
      updateMeta(content);
      bindText(content);
      bindHtml(content);
      bindImages(content);
      bindAttrs(content);
      bindForm(content);
      renderNavbar(content.navbar);
      renderHero(content.hero);
      renderQuemSomos(content.quem_somos);
      renderServices(content.o_que_fazemos);
      renderLutasGallery(content.lutas);
      renderVideoGallery(content.galeria);
      renderAbolitionDay(content.galeria?.abolition_day);
      renderParceiros(content.parceiros);
      renderContact(content.contato);
      renderFooter(content);

      // Detect campaigns page
      if (document.querySelector('#campaign-message') && content.campaigns) {
        renderCampaigns(content.campaigns);
      }
    }

    function getNestedValue(obj, path) {
      if (!obj || !path) return undefined;
      return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function updateMeta(content) {
      if (content?.site?.title) {
        document.title = content.site.title;
      }
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && content?.site?.description) {
        metaDescription.setAttribute('content', content.site.description);
      }
    }

    function bindText(content) {
      document.querySelectorAll('[data-content]').forEach((el) => {
        const path = el.getAttribute('data-content');
        const value = getNestedValue(content, path);
        if (value !== undefined && value !== null) {
          el.textContent = value;
        }
      });
    }

    function bindHtml(content) {
      document.querySelectorAll('[data-content-html]').forEach((el) => {
        const path = el.getAttribute('data-content-html');
        const value = getNestedValue(content, path);
        if (value === undefined || value === null) return;
        if (path === 'hero.headline') {
          el.innerHTML = renderHeroHeadline(value);
          return;
        }
        el.innerHTML = value;
      });
    }

    function bindImages(content) {
      document.querySelectorAll('[data-content-img]').forEach((el) => {
        const path = el.getAttribute('data-content-img');
        const value = getNestedValue(content, path);
        if (value) el.setAttribute('src', value);
      });
    }

    function bindAttrs(content) {
      document.querySelectorAll('[data-content-attr]').forEach((el) => {
        const raw = el.getAttribute('data-content-attr');
        if (!raw) return;
        const [path, attr] = raw.split('|');
        const value = getNestedValue(content, path);
        if (value !== undefined && value !== null && attr) {
          el.setAttribute(attr, value);
        }
      });
    }

    function bindForm(content) {
      const formConfig = content?.site?.form;
      const contactSection = content?.contato;
      const form = document.getElementById('contact-form');
      if (form && formConfig?.submit_endpoint) {
        form.setAttribute('action', formConfig.submit_endpoint);
      }
      if (contactSection?.form?.placeholders) {
        const ph = contactSection.form.placeholders;
        const nameEl = document.getElementById('name');
        const emailEl = document.getElementById('email');
        const subjectEl = document.getElementById('subject');
        const messageEl = document.getElementById('message');
        if (nameEl) nameEl.placeholder = ph.name || '';
        if (emailEl) emailEl.placeholder = ph.email || '';
        if (subjectEl) subjectEl.placeholder = ph.subject || '';
        if (messageEl) messageEl.placeholder = ph.message || '';
      }
    }

    function renderHeroHeadline(headline) {
      const prefix = escapeHtml(headline?.prefix || '');
      const word1 = escapeHtml(headline?.word1 || '');
      const connector = escapeHtml(headline?.connector || '');
      const word2 = escapeHtml(headline?.word2 || '');
      return `${prefix} <span class="text-luz italic">${word1}</span> ${connector} <span class="text-terra italic">${word2}</span>`.trim();
    }

    function renderNavbar(navbar) {
      if (!navbar) return;
      const desktopContainer = document.getElementById('navbar-links');
      const mobileContainer = document.getElementById('mobile-menu-links');
      if (desktopContainer) {
        desktopContainer.innerHTML = (navbar.links || []).map((link) => {
          const cls = link.cta
            ? 'nav-link bg-terra hover:bg-terra/80 text-white px-5 py-2 rounded-full transition-all text-sm uppercase tracking-widest'
            : 'nav-link text-areia/80 hover:text-luz transition-colors text-sm uppercase tracking-widest';
          return `<a href="${escapeHtml(link.href)}" class="${cls}">${escapeHtml(link.label)}</a>`;
        }).join('');
      }
      if (mobileContainer) {
        mobileContainer.innerHTML = (navbar.links || []).map((link) => {
          const cc = link.cta ? 'text-terra hover:text-luz' : 'text-areia hover:text-luz';
          return `<a href="${escapeHtml(link.href)}" class="mobile-link text-3xl font-display ${cc} transition-colors">${escapeHtml(link.label)}</a>`;
        }).join('');
      }
    }

    function renderHero(hero) {
      if (!hero) return;
      const heroVideoSource = document.getElementById('hero-video-source');
      const heroVideo = document.getElementById('hero-video');
      if (heroVideoSource && hero.video) {
        heroVideoSource.setAttribute('src', hero.video);
        if (heroVideo && typeof heroVideo.load === 'function') heroVideo.load();
      }
      const heroCta = document.getElementById('hero-cta-text');
      if (heroCta && hero.cta_text) heroCta.textContent = hero.cta_text;
    }

    function renderQuemSomos(section) {
      if (!section) return;

      // Pillars with SVG icons
      const pillarIcons = {
        layers: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.18L17.5 8 12 11.82 6.5 8 12 4.18z"/></svg>',
        eye: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z"/></svg>',
        people: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2h2v-2a2 2 0 012-2h8a2 2 0 012 2v2h2zm-4-6a6 6 0 100-12 6 6 0 000 12zm6 6v-2a4 4 0 00-3-3.87A6.01 6.01 0 0115 11a6 6 0 016 6 4 4 0 002 3.87V21h-4z"/></svg>'
      };

      const pillarsContainer = document.getElementById('pillars-grid');
      if (pillarsContainer) {
        pillarsContainer.innerHTML = (section.pillars || []).map((pillar) => `
          <div class="bg-profundo/50 border border-areia/10 rounded-2xl p-6 text-center hover:border-luz/30 transition-all group">
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-${escapeHtml(pillar.color)}/20 flex items-center justify-center group-hover:bg-${escapeHtml(pillar.color)}/40 transition-all">
              ${pillarIcons[pillar.icon] || pillarIcons.layers}
            </div>
            <h3 class="text-${escapeHtml(pillar.color)} font-display text-xl mb-1">${escapeHtml(pillar.name)}</h3>
            <p class="text-areia/60 text-sm">${escapeHtml(pillar.description)}</p>
          </div>
        `).join('');
      }

      const storiesContainer = document.getElementById('stories-carousel');
      if (storiesContainer) {
        storiesContainer.innerHTML = (section.stories || []).map((story) => `
          <img src="${escapeHtml(story.src)}" alt="${escapeHtml(story.alt || 'Story')}"
            class="snap-center flex-shrink-0 w-64 h-[500px] rounded-2xl object-cover border-2 border-areia/10 hover:border-luz/30 transition-all" loading="lazy">
        `).join('');
      }

      const quoteText = document.getElementById('quote-text');
      const quoteAuthor = document.getElementById('quote-author');
      if (quoteText && section.quote?.text) quoteText.textContent = `"${section.quote.text}"`;
      if (quoteAuthor && section.quote?.author) quoteAuthor.textContent = `— ${section.quote.author}`;
    }

    function renderServices(section) {
      const container = document.getElementById('services-grid');
      if (!container || !section) return;

      const iconMap = {
        terra: `<svg class="w-8 h-8 text-terra" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
        raiz: `<svg class="w-8 h-8 text-raiz" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        luz: `<svg class="w-8 h-8 text-luz" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
        dourado: `<svg class="w-8 h-8 text-dourado" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`
      };

      container.innerHTML = (section.services || []).map((service) => `
        <div class="reveal-up service-card group relative bg-gradient-to-br from-profundo to-${escapeHtml(service.color)}/20 rounded-3xl p-8 md:p-10 border border-areia/5 hover:border-${escapeHtml(service.color)}/30 transition-all duration-500 overflow-hidden">
          <div class="absolute top-0 right-0 w-40 h-40 bg-${escapeHtml(service.color)}/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div class="relative z-10">
            <div class="w-16 h-16 rounded-2xl bg-${escapeHtml(service.color)}/10 flex items-center justify-center mb-6 group-hover:bg-${escapeHtml(service.color)}/20 transition-all">
              ${iconMap[service.color] || iconMap.terra}
            </div>
            <h3 class="font-display text-2xl md:text-3xl text-white mb-3">${escapeHtml(service.title)}</h3>
            <p class="text-areia/70 leading-relaxed">${escapeHtml(service.description)}</p>
          </div>
        </div>
      `).join('');
    }

    function renderLutasGallery(section) {
      const container = document.getElementById('lutas-gallery');
      if (!container || !section) return;

      container.innerHTML = (section.images || []).map((img, index) => `
        <div class="gallery-item group relative rounded-2xl overflow-hidden cursor-pointer ${img.aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'}" onclick="openLightbox(${index}, event)">
          <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || 'Galeria')}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy">
          <div class="absolute inset-0 bg-profundo/0 group-hover:bg-profundo/40 transition-all duration-300 flex items-center justify-center">
            <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
            </svg>
          </div>
        </div>
      `).join('');

      window.galleryImages = (section.images || []).map((img) => img.src);
    }

    function renderVideoGallery(section) {
      const container = document.getElementById('videos-grid');
      if (!container || !section) return;

      container.innerHTML = (section.videos || []).map((video) => `
        <div class="reveal-up video-card group relative rounded-2xl overflow-hidden cursor-pointer aspect-video" onclick="openVideoModal('${escapeHtml(video.src)}')">
          <img src="${escapeHtml(video.poster)}" alt="${escapeHtml(video.title)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-profundo/90 via-profundo/30 to-profundo/20 group-hover:from-profundo/70 group-hover:via-profundo/20 transition-all duration-500 flex items-center justify-center">
            <div class="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all border-2 border-white/20">
              <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-profundo to-transparent">
            <p class="text-white font-display text-xl">${escapeHtml(video.title)}</p>
            <p class="text-areia/70 text-sm">${escapeHtml(video.description)}</p>
          </div>
        </div>
      `).join('');
    }

    function renderAbolitionDay(section) {
      if (!section) return;
      const title = document.getElementById('abolition-title');
      const subtitle = document.getElementById('abolition-subtitle');
      const container = document.getElementById('abolition-grid');
      if (title) title.textContent = section.title || '';
      if (subtitle) subtitle.textContent = section.subtitle || '';
      if (container) {
        container.innerHTML = (section.images || []).map((img) => `
          <div class="group relative rounded-2xl overflow-hidden aspect-[9/16]">
            <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || 'Abolition Day')}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
          </div>
        `).join('');
      }
    }

    function renderParceiros(section) {
      if (!section) return;
      const postsContainer = document.getElementById('partners-posts');
      const storiesContainer = document.getElementById('partners-stories');
      if (postsContainer) {
        postsContainer.innerHTML = (section.posts || []).map((post, index) => `
          <div class="reveal-up group relative rounded-2xl overflow-hidden cursor-pointer aspect-square" onclick="openLightboxPartner(${index}, event)">
            <img src="${escapeHtml(post.src)}" alt="${escapeHtml(post.alt || 'Parceiro')}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-profundo/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        `).join('');
      }
      if (storiesContainer) {
        storiesContainer.innerHTML = (section.stories || []).map((story) => `
          <img src="${escapeHtml(story.src)}" alt="${escapeHtml(story.alt || 'Parceiro Story')}" class="snap-center flex-shrink-0 w-56 h-[400px] rounded-2xl object-cover border border-areia/5" loading="lazy">
        `).join('');
      }
      window.partnerImages = (section.posts || []).map((post) => post.src);
    }

    function renderContact(section) {
      if (!section || !section.form) return;
      // Labels are already handled by data-content attributes
      // Placeholders handled by bindForm
      // Submit button handled by data-content
      // Success messages handled by data-content
      // This function is a placeholder for future extensions
    }

    // ============================================
    // CAMPAIGNS PAGE RENDERER
    // ============================================
    function renderCampaigns(section) {
      if (!section) return;

      // Campaign message paragraphs
      const messageContainer = document.getElementById('campaign-message');
      if (messageContainer && section.message_paragraphs) {
        messageContainer.innerHTML = section.message_paragraphs.map(p =>
          `<p>${escapeHtml(p)}</p>`
        ).join('');
      }

      // Action steps
      const actionStepsContainer = document.getElementById('campaign-action-steps');
      if (actionStepsContainer && section.action_steps) {
        actionStepsContainer.innerHTML = `<ol class="space-y-4 text-areia/80">${
          section.action_steps.map(step =>
            `<li><strong class="text-white">${escapeHtml(step.number)}</strong> ${escapeHtml(step.text)}</li>`
          ).join('')
        }</ol>`;
      }

      // Template text
      const templateContainer = document.getElementById('campaign-template');
      if (templateContainer && section.template_text) {
        templateContainer.textContent = section.template_text;
      }

      // Deputies
      renderDeputies(section.deputies_section);
    }

    function renderDeputies(section) {
      if (!section || !section.deputies) return;

      const grid = document.getElementById('deputies-grid');
      if (!grid) return;

      grid.innerHTML = section.deputies.map(dep => `
        <article class="campaign-card rounded-[24px] border border-areia/10 bg-white/5 p-6 hover:border-luz/30 transition-colors">
          <p class="text-luz text-xs uppercase tracking-[0.3em] mb-3">titular</p>
          <h3 class="text-white font-semibold text-xl leading-snug mb-3">${escapeHtml(dep.name)}</h3>
          <p class="text-areia/60 text-sm mb-4">${escapeHtml(dep.party)}</p>
          <div class="space-y-3">
            <a href="mailto:${escapeHtml(dep.email)}" class="block break-all text-dourado hover:text-luz transition-colors">${escapeHtml(dep.email)}</a>
            <button class="copy-email bg-profundo/70 hover:bg-profundo text-white px-4 py-3 rounded-2xl text-sm transition-colors w-full" data-email="${escapeHtml(dep.email)}">Copiar email</button>
          </div>
        </article>
      `).join('');

      // Mailto link for all emails
      const allEmails = section.deputies.map(d => d.email).join(',');
      const mailLink = document.getElementById('mailAllLink');
      if (mailLink) mailLink.href = `mailto:?bcc=${allEmails}`;
    }

    function renderFooter(content) {
      const footerText = document.getElementById('footer-prefix');
      if (footerText && content?.site?.footer_year_prefix) {
        footerText.textContent = content.site.footer_year_prefix;
      }
    }

    document.addEventListener('DOMContentLoaded', loadContent);
  })();
