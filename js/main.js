// ============================================
// COSMOPOLÍTICAS — Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Year ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Lazy Load Images ---
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded'));
    }
  });

  // ============================================
  // CUSTOM CURSOR
  // ============================================
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  if (window.innerWidth >= 1024) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .gallery-item, .video-card, .service-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '12px'; cursor.style.height = '12px';
        cursor.style.background = '#C4AA3C';
        cursorRing.style.borderColor = '#9C271E';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '16px'; cursor.style.height = '16px';
        cursor.style.background = '#F39227';
        cursorRing.style.borderColor = '#C4AA3C';
      });
    });
  }

  // ============================================
  // NAVBAR — scroll effect
  // ============================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    const s = window.pageYOffset;
    navbar.classList.toggle('scrolled', s > 80);
    const hero = document.querySelector('.hero-video');
    if (hero && s < window.innerHeight) {
      hero.style.transform = `translateY(${s * 0.3}px)`;
    }
  });

  // ============================================
  // MOBILE MENU
  // ============================================
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;

  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('translate-x-full', !menuOpen);
    mobileMenu.classList.toggle('translate-x-0', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      menuBtn.classList.remove('active');
      mobileMenu.classList.add('translate-x-full');
      mobileMenu.classList.remove('translate-x-0');
      document.body.style.overflow = '';
    });
  });

  // ============================================
  // SCROLL REVEAL
  // ============================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up')
    .forEach(el => revealObserver.observe(el));

  document.querySelectorAll('section + div').forEach(d => {
    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.5 }).observe(d);
  });

  // ============================================
  // PARTICLES
  // ============================================
  const particlesContainer = document.getElementById('particles');
  const particleColors = ['#F39227', '#9C271E', '#C4AA3C', '#294902', '#DBC6C1'];

  function createParticle() {
    if (!particlesContainer) return;
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    const dur = Math.random() * 15 + 10;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      background:${particleColors[Math.floor(Math.random()*particleColors.length)]};
      left:${Math.random()*100}%;
      animation-duration:${dur}s;animation-delay:${Math.random()*5}s;
      opacity:${Math.random()*0.5+0.1};
    `;
    particlesContainer.appendChild(p);
    setTimeout(() => { p.remove(); createParticle(); }, (dur+5)*1000);
  }
  for (let i = 0; i < 25; i++) setTimeout(createParticle, i * 200);

  // ============================================
  // CONTACT FORM — FormSubmit.co
  // ============================================
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'enviando...';
      btn.disabled = true;

      const fd = new FormData(contactForm);

      try {
        const res = await fetch('https://formsubmit.co/ajax/contato@cosmopoliticas.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: fd.get('name'),
            email: fd.get('email'),
            assunto: fd.get('subject'),
            mensagem: fd.get('message'),
          })
        });
        const data = await res.json();
        if (data.success) {
          contactForm.style.display = 'none';
          formSuccess.classList.remove('hidden');
        } else throw new Error('FormSubmit error');
      } catch(err) {
        // Fallback: abre o cliente de email do usuário
        const mailto = `mailto:contato@cosmopoliticas.org?subject=${encodeURIComponent(fd.get('subject')||'Contato pelo site')}&body=${encodeURIComponent(`Nome: ${fd.get('name')}\nEmail: ${fd.get('email')}\n\n${fd.get('message')}`)}`;
        window.location.href = mailto;
        btn.textContent = 'enviar mensagem';
        btn.disabled = false;
      }
    });
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - 80,
        behavior: 'smooth'
      });
    });
  });

  // ============================================
  // LIGHTBOX — event listeners (sem inline onclick)
  // ============================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCounter = document.getElementById('lightbox-counter');

  // Close button
  const lightboxClose = document.getElementById('lightbox-close');
  if (lightboxClose) {
    lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      lightbox.classList.add('hidden');
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  // Prev/Next buttons
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLB(-1); });
  if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLB(1); });

  // Click on backdrop to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.add('hidden');
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // ============================================
  // VIDEO MODAL — event listeners
  // ============================================
  const videoModal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video');
  const videoClose = document.getElementById('video-close');

  if (videoClose) {
    videoClose.addEventListener('click', () => closeVideo());
  }

  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeVideo();
  });

  function closeVideo() {
    videoModal.classList.add('hidden');
    videoModal.style.display = 'none';
    modalVideo.pause();
    modalVideo.currentTime = 0;
    document.body.style.overflow = '';
  }

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('hidden')) {
      if (e.key === 'Escape') {
        lightbox.classList.add('hidden');
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
      }
      if (e.key === 'ArrowLeft') navigateLB(-1);
      if (e.key === 'ArrowRight') navigateLB(1);
    }
    if (!videoModal.classList.contains('hidden') && e.key === 'Escape') {
      closeVideo();
    }
  });

});

// --- Global functions (called from inline onclick in HTML) ---

let currentLBImages = [];
let currentLBIndex = 0;

const galleryImages = [
  'assets/feed/1-1.png','assets/feed/1-3.png','assets/feed/1-5.png',
  'assets/feed/1-8.png','assets/feed/1-10.png','assets/feed/1-12.png',
  'assets/feed/1-15.png','assets/feed/1-16.png','assets/feed/3-1.png',
  'assets/feed/3-6.png','assets/feed/3-8.png','assets/feed/6-0.png'
];

const partnerImages = [
  'assets/parceiros/Parceiros-Post-1.png',
  'assets/parceiros/Parceiros-Post-2.png',
  'assets/parceiros/Parceiros-Post-3.png',
  'assets/parceiros/Parceiros-Post-4.png'
];

function openLightbox(index, event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  currentLBImages = galleryImages;
  currentLBIndex = index;
  showLightbox();
}

function openLightboxPartner(index, event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  currentLBImages = partnerImages;
  currentLBIndex = index;
  showLightbox();
}

function showLightbox() {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const counter = document.getElementById('lightbox-counter');
  img.src = currentLBImages[currentLBIndex];
  img.classList.add('loaded');
  counter.textContent = `${currentLBIndex + 1} / ${currentLBImages.length}`;
  lb.classList.remove('hidden');
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function navigateLB(dir) {
  currentLBIndex += dir;
  if (currentLBIndex < 0) currentLBIndex = currentLBImages.length - 1;
  if (currentLBIndex >= currentLBImages.length) currentLBIndex = 0;
  const img = document.getElementById('lightbox-img');
  img.src = currentLBImages[currentLBIndex];
  img.classList.remove('loaded');
  img.onload = () => img.classList.add('loaded');
  img.onerror = () => img.classList.add('loaded');
  document.getElementById('lightbox-counter').textContent = `${currentLBIndex + 1} / ${currentLBImages.length}`;
}

function openVideoModal(src) {
  const vm = document.getElementById('video-modal');
  const video = document.getElementById('modal-video');
  video.querySelector('source').src = src;
  video.load();
  vm.classList.remove('hidden');
  vm.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
