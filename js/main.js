// ============================================
// COSMOPOLÍTICAS — Main JavaScript
// Compatível com conteúdo estático e com content-loader.js
// ============================================

(() => {
  let currentLBImages = [];
  let currentLBIndex = 0;
  let revealObserver = null;
  let dividerObserver = null;
  let cursorInitialized = false;
  let menuOpen = false;

  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function getGalleryImages() {
    if (Array.isArray(window.galleryImages) && window.galleryImages.length) {
      return window.galleryImages;
    }

    return qsa('#lutas-gallery img').map(img => img.getAttribute('src')).filter(Boolean);
  }

  function getPartnerImages() {
    if (Array.isArray(window.partnerImages) && window.partnerImages.length) {
      return window.partnerImages;
    }

    return qsa('#partners-posts img').map(img => img.getAttribute('src')).filter(Boolean);
  }

  function markImagesAsLoaded(scope = document) {
    qsa('img', scope).forEach(img => {
      const markLoaded = () => img.classList.add('loaded');

      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      } else {
        img.addEventListener('load', markLoaded, { once: true });
        img.addEventListener('error', markLoaded, { once: true });
      }
    });
  }

  function initYear() {
    const yearEl = qs('#year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function initCustomCursor() {
    if (cursorInitialized) return;
    if (window.innerWidth < 1024) return;

    const cursor = qs('#cursor');
    const cursorRing = qs('#cursor-ring');

    if (!cursor || !cursorRing) return;

    cursorInitialized = true;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    cursor.style.opacity = '1';
    cursorRing.style.opacity = '0.5';

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX - 8}px, ${mouseY - 8}px)`;
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      requestAnimationFrame(animateRing);
    }

    animateRing();

    document.addEventListener('mouseover', (e) => {
      const interactive = e.target.closest('a, button, .gallery-item, .video-card, .service-card, [role="button"]');
      if (!interactive) return;

      cursor.style.width = '12px';
      cursor.style.height = '12px';
      cursor.style.background = '#C4AA3C';
      cursorRing.style.borderColor = '#9C271E';
      cursorRing.style.opacity = '0.9';
    });

    document.addEventListener('mouseout', (e) => {
      const interactive = e.target.closest('a, button, .gallery-item, .video-card, .service-card, [role="button"]');
      if (!interactive) return;

      cursor.style.width = '16px';
      cursor.style.height = '16px';
      cursor.style.background = '#F39227';
      cursorRing.style.borderColor = '#C4AA3C';
      cursorRing.style.opacity = '0.5';
    });
  }

  function initNavbar() {
    const navbar = qs('#navbar');
    if (!navbar) return;

    const onScroll = () => {
      const s = window.pageYOffset || document.documentElement.scrollTop;
      navbar.classList.toggle('scrolled', s > 80);

      const hero = qs('.hero-video');
      if (hero && s < window.innerHeight) {
        hero.style.transform = `translateY(${s * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function closeMobileMenu() {
    const menuBtn = qs('#menu-btn');
    const mobileMenu = qs('#mobile-menu');

    menuOpen = false;

    if (menuBtn) menuBtn.classList.remove('active');
    if (mobileMenu) {
      mobileMenu.classList.add('translate-x-full');
      mobileMenu.classList.remove('translate-x-0');
    }

    document.body.style.overflow = '';
  }

  function initMobileMenu() {
    const menuBtn = qs('#menu-btn');
    const mobileMenu = qs('#mobile-menu');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
      menuOpen = !menuOpen;
      menuBtn.classList.toggle('active', menuOpen);
      mobileMenu.classList.toggle('translate-x-full', !menuOpen);
      mobileMenu.classList.toggle('translate-x-0', menuOpen);
      document.body.style.overflow = menuOpen ? 'hidden' : '';
    });

    document.addEventListener('click', (e) => {
      if (!menuOpen) return;
      const clickedLink = e.target.closest('.mobile-link');
      if (clickedLink) {
        closeMobileMenu();
      }
    });
  }

  function initReveal() {
    if (revealObserver) {
      revealObserver.disconnect();
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    qsa('.reveal, .reveal-left, .reveal-right, .reveal-up').forEach(el => {
      revealObserver.observe(el);
    });

    if (dividerObserver) {
      dividerObserver.disconnect();
    }

    dividerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.5 });

    qsa('section + div').forEach(divider => {
      dividerObserver.observe(divider);
    });
  }

  function initParticles() {
    const particlesContainer = qs('#particles');
    if (!particlesContainer || particlesContainer.dataset.particlesInit === '1') return;

    particlesContainer.dataset.particlesInit = '1';

    const particleColors = ['#F39227', '#9C271E', '#C4AA3C', '#294902', '#DBC6C1'];

    function createParticle() {
      if (!particlesContainer.isConnected) return;

      const p = document.createElement('div');
      p.className = 'particle';

      const size = Math.random() * 4 + 2;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;
      const left = Math.random() * 100;
      const opacity = Math.random() * 0.5 + 0.1;
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];

      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = color;
      p.style.left = `${left}%`;
      p.style.animationDuration = `${duration}s`;
      p.style.animationDelay = `${delay}s`;
      p.style.opacity = opacity;

      particlesContainer.appendChild(p);

      setTimeout(() => {
        p.remove();
        createParticle();
      }, (duration + delay) * 1000);
    }

    for (let i = 0; i < 25; i++) {
      setTimeout(createParticle, i * 200);
    }
  }

  function initContactForm() {
    const contactForm = qs('#contact-form');
    const formSuccess = qs('#form-success');

    if (!contactForm || contactForm.dataset.bound === '1') return;
    contactForm.dataset.bound = '1';

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('button[type="submit"]');
      const btnLabel = btn ? btn.textContent : 'enviar mensagem';
      if (btn) {
        btn.textContent = 'enviando...';
        btn.disabled = true;
      }

      const fd = new FormData(contactForm);

      const endpoint = contactForm.getAttribute('action') || 'https://formsubmit.co/ajax/contato@cosmopoliticas.org';
      const ajaxEndpoint = endpoint.includes('/ajax/')
        ? endpoint
        : endpoint.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

      try {
        const res = await fetch(ajaxEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: fd.get('name'),
            email: fd.get('email'),
            subject: fd.get('subject'),
            message: fd.get('message'),
            _subject: fd.get('_subject') || 'Cosmopolíticas: Novo contato pelo site',
            _captcha: fd.get('_captcha') || 'false',
            _template: fd.get('_template') || 'table'
          })
        });

        const data = await res.json();

        if (data.success) {
          contactForm.style.display = 'none';
          if (formSuccess) formSuccess.classList.remove('hidden');
          return;
        }

        throw new Error('FormSubmit error');
      } catch (err) {
        const subject = fd.get('subject') || 'Contato pelo site';
        const body = `Nome: ${fd.get('name') || ''}\nEmail: ${fd.get('email') || ''}\n\n${fd.get('message') || ''}`;
        const mailto = `mailto:contato@cosmopoliticas.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;

        if (btn) {
          btn.textContent = btnLabel;
          btn.disabled = false;
        }
      }
    });
  }

  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = qs(href);
      if (!target) return;

      e.preventDefault();

      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top,
        behavior: 'smooth'
      });

      if (link.classList.contains('mobile-link')) {
        closeMobileMenu();
      }
    });
  }

  function showLightbox() {
    const lb = qs('#lightbox');
    const img = qs('#lightbox-img');
    const counter = qs('#lightbox-counter');

    if (!lb || !img || !currentLBImages.length) return;

    img.classList.remove('loaded');
    img.src = currentLBImages[currentLBIndex];
    img.onload = () => img.classList.add('loaded');
    img.onerror = () => img.classList.add('loaded');

    if (counter) {
      counter.textContent = `${currentLBIndex + 1} / ${currentLBImages.length}`;
    }

    lb.classList.remove('hidden');
    lb.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function navigateLB(direction) {
    if (!currentLBImages.length) return;

    currentLBIndex += direction;

    if (currentLBIndex < 0) currentLBIndex = currentLBImages.length - 1;
    if (currentLBIndex >= currentLBImages.length) currentLBIndex = 0;

    showLightbox();
  }

  function closeLightbox() {
    const lb = qs('#lightbox');
    if (!lb) return;

    lb.classList.add('hidden');
    lb.style.display = 'none';
    document.body.style.overflow = '';
  }

  function openLightbox(index, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    currentLBImages = getGalleryImages();
    currentLBIndex = index;
    showLightbox();
  }

  function openLightboxPartner(index, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    currentLBImages = getPartnerImages();
    currentLBIndex = index;
    showLightbox();
  }

  function initLightbox() {
    const lightbox = qs('#lightbox');
    const lightboxClose = qs('#lightbox-close');
    const lightboxPrev = qs('#lightbox-prev');
    const lightboxNext = qs('#lightbox-next');

    if (!lightbox) return;

    if (lightboxClose && lightboxClose.dataset.bound !== '1') {
      lightboxClose.dataset.bound = '1';
      lightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
      });
    }

    if (lightboxPrev && lightboxPrev.dataset.bound !== '1') {
      lightboxPrev.dataset.bound = '1';
      lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLB(-1);
      });
    }

    if (lightboxNext && lightboxNext.dataset.bound !== '1') {
      lightboxNext.dataset.bound = '1';
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLB(1);
      });
    }

    if (lightbox.dataset.bound !== '1') {
      lightbox.dataset.bound = '1';
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });
    }
  }

  function openVideoModal(src) {
    const vm = qs('#video-modal');
    const video = qs('#modal-video');

    if (!vm || !video) return;

    const source = video.querySelector('source');
    if (source) {
      source.src = src;
      video.load();
    }

    vm.classList.remove('hidden');
    vm.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  function closeVideoModal() {
    const vm = qs('#video-modal');
    const video = qs('#modal-video');

    if (!vm || !video) return;

    vm.classList.add('hidden');
    vm.style.display = 'none';
    video.pause();
    video.currentTime = 0;
    document.body.style.overflow = '';
  }

  function initVideoModal() {
    const videoModal = qs('#video-modal');
    const videoClose = qs('#video-close');

    if (videoClose && videoClose.dataset.bound !== '1') {
      videoClose.dataset.bound = '1';
      videoClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeVideoModal();
      });
    }

    if (videoModal && videoModal.dataset.bound !== '1') {
      videoModal.dataset.bound = '1';
      videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
          closeVideoModal();
        }
      });
    }
  }

  function initKeyboardShortcuts() {
    if (document.body.dataset.keysBound === '1') return;
    document.body.dataset.keysBound = '1';

    document.addEventListener('keydown', (e) => {
      const lightbox = qs('#lightbox');
      const videoModal = qs('#video-modal');

      const lightboxOpen = lightbox && !lightbox.classList.contains('hidden');
      const videoOpen = videoModal && !videoModal.classList.contains('hidden');

      if (e.key === 'Escape') {
        if (lightboxOpen) closeLightbox();
        if (videoOpen) closeVideoModal();
      }

      if (lightboxOpen) {
        if (e.key === 'ArrowLeft') navigateLB(-1);
        if (e.key === 'ArrowRight') navigateLB(1);
      }
    });
  }

  function initDynamicBindings() {
    document.addEventListener('click', (e) => {
      const galleryItem = e.target.closest('#lutas-gallery .gallery-item');
      if (galleryItem) {
        const items = qsa('#lutas-gallery .gallery-item');
        const index = items.indexOf(galleryItem);
        if (index >= 0) {
          openLightbox(index, e);
          return;
        }
      }

      const partnerItem = e.target.closest('#partners-posts [onclick], #partners-posts .group');
      if (partnerItem) {
        const items = qsa('#partners-posts > *');
        const index = items.indexOf(partnerItem.closest('#partners-posts > *'));
        if (index >= 0) {
          openLightboxPartner(index, e);
        }
      }
    });
  }

  function initAll() {
    initYear();
    markImagesAsLoaded();
    initCustomCursor();
    initNavbar();
    initMobileMenu();
    initReveal();
    initParticles();
    initContactForm();
    initSmoothScroll();
    initLightbox();
    initVideoModal();
    initKeyboardShortcuts();
    initDynamicBindings();
  }

  document.addEventListener('DOMContentLoaded', initAll);

  document.addEventListener('content:loaded', () => {
    markImagesAsLoaded();
    initReveal();
    initContactForm();
  });

  window.openLightbox = openLightbox;
  window.openLightboxPartner = openLightboxPartner;
  window.openVideoModal = openVideoModal;
  window.closeVideoModal = closeVideoModal;
})();