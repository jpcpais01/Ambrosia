/* ============================================================
   AMBROSIA COFFEE — MAIN JS
   Lenis smooth scroll + GSAP ScrollTrigger animations
   ============================================================ */

/* ── LOADER ─────────────────────────────────────────────────── */
const loader = document.getElementById('loader');
const loaderBar = document.querySelector('.loader-bar');
const loaderPercent = document.querySelector('.loader-percent');

let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 18 + 6;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);
    setTimeout(hideLoader, 280);
  }
  if (loaderBar) loaderBar.style.width = loadProgress + '%';
  if (loaderPercent) loaderPercent.textContent = Math.floor(loadProgress) + '%';
}, 80);

function hideLoader() {
  if (!loader) return;
  loader.classList.add('hidden');
  document.body.style.overflow = '';
  initAll();
}

if (loader) document.body.style.overflow = 'hidden';
else initAll();

/* ── INIT ───────────────────────────────────────────────────── */
function initAll() {
  initCursor();
  initLenis();
  initNav();
  initScrollProgress();
  initHero();
  initVideoScrub();
  initScrollAnimations();
  initParallax();
  initMarquee();
  initMobileMenu();
  initCart();
  initProductFilters();
  initOriginCards();
}

/* ── CUSTOM CURSOR ──────────────────────────────────────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = -100, my = -100, rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .product-card, .origin-card, .value-card, .team-card, .filter-pill').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('focus', () => document.body.classList.add('cursor-text'));
    el.addEventListener('blur',  () => document.body.classList.remove('cursor-text'));
  });
}

/* ── LENIS SMOOTH SCROLL ────────────────────────────────────── */
let lenis;
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* ── NAVIGATION ─────────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Active link
  const links = document.querySelectorAll('.nav-link');
  const page = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') ||
        (page === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── SCROLL PROGRESS ────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = window.scrollY / (h.scrollHeight - h.clientHeight);
    bar.style.transform = `scaleX(${pct})`;
  }, { passive: true });
}

/* ── HERO ANIMATIONS ────────────────────────────────────────── */
function initHero() {
  if (typeof gsap === 'undefined') return;

  gsap.timeline({ delay: 0.2 })
    .from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' })
    .from('.hero-title .reveal-line', {
      y: '110%', opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.12
    }, '-=0.5')
    .from('.hero-sub', { opacity: 0, y: 25, duration: 0.9, ease: 'power3.out' }, '-=0.6')
    .from('.hero-cta > *', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out', stagger: 0.12 }, '-=0.5')
    .from('.hero-scroll-hint', { opacity: 0, duration: 0.6 }, '-=0.3')
    .from('.hero-badge', { opacity: 0, scale: 0.6, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.8');

  // Parallax hero video/bg on scroll
  const heroMedia = document.querySelector('.hero-media');
  if (heroMedia && typeof ScrollTrigger !== 'undefined') {
    gsap.to(heroMedia, {
      yPercent: 25,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }
}

/* ── VIDEO SCRUB ────────────────────────────────────────────── */
function initVideoScrub() {
  const section = document.getElementById('video-scrub');
  if (!section) return;

  const video  = section.querySelector('.scrub-video');
  const canvas = section.querySelector('.scrub-canvas');
  const texts  = section.querySelectorAll('.scrub-text');

  let currentRate = 1;
  let lastScrollY = window.scrollY;
  let revSeeking  = false; // backward seek in-flight
  let revPending  = -1;    // latest backward target while seeking
  let ctx = null;

  if (canvas) {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }, { passive: true });
  }

  if (video) {
    video.loop  = true;
    video.muted = true;
    video.addEventListener('canplay',  () => video.play().catch(() => {}));
    video.addEventListener('playing',  () => { if (canvas) canvas.style.display = 'none'; });

    // Backward seek queue — applies latest pending target once current seek finishes
    video.addEventListener('seeked', () => {
      if (revPending >= 0) {
        video.currentTime = revPending;
        revPending = -1;
      } else {
        revSeeking = false;
      }
    });
  }

  // Text zones in scroll-progress space — independent of video time
  const TEXT_ZONES = [
    { show: 0.10, hide: 0.33 },
    { show: 0.50, hide: 0.68 },
    { show: 0.82, hide: 0.95 },
  ];

  // Max px-per-frame before speed is capped (prevents warp on fast flick)
  const MAX_DELTA = 22;

  function tick() {
    const scrollY  = window.scrollY;
    const rawDelta = scrollY - lastScrollY;
    lastScrollY    = scrollY;

    // Clamp so a sudden fast flick never warp-speeds the video
    const delta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), MAX_DELTA);

    if (video && video.duration > 0) {

      if (delta > 0.5) {
        // ── Scrolling DOWN → play forward, boost rate ─────────
        revSeeking = false;
        revPending = -1;
        if (video.paused) video.play().catch(() => {});
        const targetRate = 1 + Math.min(delta / 10, 2); // 1× – 3×, hard cap
        currentRate += (targetRate - currentRate) * 0.18; // snap up fast
        video.playbackRate = currentRate;

      } else if (delta < -0.5) {
        // ── Scrolling UP → seek backwards ────────────────────
        if (!video.paused) video.pause();
        const step   = (Math.abs(delta) / MAX_DELTA) * 0.12 * video.duration;
        const target = Math.max(0, video.currentTime - step);
        if (!revSeeking) {
          video.currentTime = target;
          revSeeking = true;
        } else {
          revPending = target; // queue most recent target
        }
        currentRate = 1; // reset so next forward scroll starts fresh at 1×

      } else {
        // ── Idle → ease back to 1× and keep playing ──────────
        if (video.paused && !revSeeking) video.play().catch(() => {});
        currentRate += (1 - currentRate) * 0.05; // slow ease back
        video.playbackRate = Math.max(0.5, currentRate);
      }
    }

    // Scroll progress through section (for text zones)
    const rect     = section.getBoundingClientRect();
    const traveled = -rect.top;
    const total    = rect.height - window.innerHeight;
    const progress = Math.max(0, Math.min(1, traveled / total));

    texts.forEach((t, i) => {
      const z = TEXT_ZONES[i];
      if (!z) return;
      t.classList.toggle('visible', progress >= z.show && progress <= z.hide);
    });

    if (canvas && canvas.style.display !== 'none' && ctx) {
      drawPlaceholder(ctx, canvas, progress);
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function drawPlaceholder(ctx, canvas, progress) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const grd = ctx.createLinearGradient(0, 0, W, H);
  const h1 = 30 + progress * 80;
  grd.addColorStop(0,   `hsl(${h1},      60%, 8%)`);
  grd.addColorStop(0.5, `hsl(${h1 + 20}, 50%, 15%)`);
  grd.addColorStop(1,   `hsl(${h1 + 40}, 40%, 6%)`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) {
    const x = W * (0.1 + (i * 0.16) + Math.sin(progress * Math.PI * 2 + i) * 0.05);
    const y = H * (0.3 + Math.cos(progress * Math.PI + i * 1.2) * 0.25);
    const r = 40 + i * 20 + progress * 30;
    const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
    g2.addColorStop(0, `rgba(200,146,42,${0.06 - i * 0.008})`);
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

/* ── SCROLL ANIMATIONS ──────────────────────────────────────── */
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Generic fade-up
  gsap.utils.toArray('.js-fade-up').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  gsap.utils.toArray('.js-fade-in').forEach(el => {
    gsap.to(el, {
      opacity: 1, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  gsap.utils.toArray('.js-scale-in').forEach(el => {
    gsap.to(el, {
      opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  gsap.utils.toArray('.js-slide-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  gsap.utils.toArray('.js-slide-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  // Staggered children
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const delay  = parseFloat(parent.dataset.stagger) || 0.12;
    const target = parent.dataset.staggerTarget || ':scope > *';
    gsap.from(parent.querySelectorAll(target), {
      opacity: 0, y: 35, duration: 0.8, ease: 'power3.out', stagger: delay,
      scrollTrigger: { trigger: parent, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  // Manifesto text
  const manifesto = document.querySelector('.manifesto-text');
  if (manifesto) {
    gsap.from(manifesto, {
      opacity: 0, y: 50, duration: 1.2, ease: 'power4.out',
      scrollTrigger: { trigger: manifesto, start: 'top 80%' }
    });
  }

  // Origin cards
  const originCards = document.querySelectorAll('.origin-card');
  if (originCards.length) {
    gsap.from(originCards, {
      opacity: 0, y: 40, scale: 0.96, duration: 0.7, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.origins-grid', start: 'top 85%' }
    });
  }

  // Process steps
  const steps = document.querySelectorAll('.process-step');
  if (steps.length) {
    gsap.from(steps, {
      opacity: 0, y: 50, duration: 0.8, ease: 'power3.out', stagger: 0.15,
      scrollTrigger: { trigger: '.process-steps', start: 'top 80%' }
    });
  }

  // Testimonials horizontal scroll feel
  const testTrack = document.querySelector('.testimonials-track');
  if (testTrack) {
    gsap.from('.testimonial-card', {
      opacity: 0, x: 60, duration: 0.8, ease: 'power3.out', stagger: 0.15,
      scrollTrigger: { trigger: testTrack, start: 'top 85%' }
    });
  }

  // Values grid
  const valuecards = document.querySelectorAll('.value-card');
  if (valuecards.length) {
    gsap.from(valuecards, {
      opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.values-grid', start: 'top 85%' }
    });
  }

  // Timeline items
  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      opacity: 0, x: i % 2 === 0 ? -50 : 50, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 85%' }
    });
  });

  // Tropical section title
  const tropTitle = document.querySelector('.tropical-title');
  if (tropTitle) {
    gsap.from(tropTitle, {
      opacity: 0, y: 80, duration: 1.2, ease: 'power4.out',
      scrollTrigger: { trigger: tropTitle, start: 'top 80%' }
    });
  }

  // Split content
  const splitContent = document.querySelector('.split-content');
  if (splitContent) {
    gsap.from(splitContent.children, {
      opacity: 0, x: 40, duration: 0.8, ease: 'power3.out', stagger: 0.15,
      scrollTrigger: { trigger: splitContent, start: 'top 80%' }
    });
  }

  // Story content
  const storyContent = document.querySelector('.story-content');
  if (storyContent) {
    gsap.from(storyContent.children, {
      opacity: 0, x: 50, duration: 0.9, ease: 'power3.out', stagger: 0.15,
      scrollTrigger: { trigger: storyContent, start: 'top 80%' }
    });
  }

  // Newsletter
  const newsletterInner = document.querySelector('.newsletter-inner');
  if (newsletterInner) {
    gsap.from(newsletterInner.children, {
      opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: newsletterInner, start: 'top 85%' }
    });
  }

  // Footer
  gsap.from('.footer-top > *', {
    opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', stagger: 0.12,
    scrollTrigger: { trigger: '.footer-top', start: 'top 90%' }
  });
}

/* ── PARALLAX ───────────────────────────────────────────────── */
function initParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Split media parallax
  const splitMedia = document.querySelector('.split-media-inner');
  if (splitMedia) {
    gsap.to(splitMedia, {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: '#immersive-split',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // Tropical background parallax
  const tropBg = document.querySelector('.tropical-bg');
  if (tropBg) {
    gsap.to(tropBg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '#tropical',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // Leaf parallax
  document.querySelectorAll('.leaf').forEach((leaf, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const speed = 0.08 + (i * 0.04);
    gsap.to(leaf, {
      yPercent: dir * 40 * speed * 10,
      xPercent: dir * 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '#tropical',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  });

  // Page hero parallax
  const pageHeroImg = document.querySelector('.page-hero-img, .about-hero-bg');
  if (pageHeroImg) {
    gsap.to(pageHeroImg, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: pageHeroImg.closest('section, #products-hero, #about-hero'),
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // Story image parallax
  const storyImg = document.querySelector('.story-img-main');
  if (storyImg) {
    gsap.to(storyImg, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '#about-story',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }
}

/* ── MARQUEE ────────────────────────────────────────────────── */
function initMarquee() {
  // Clone items for seamless loop
  document.querySelectorAll('.marquee-track').forEach(track => {
    const clone = track.cloneNode(true);
    track.parentElement.appendChild(clone);
  });
}

/* ── MOBILE MENU ────────────────────────────────────────────── */
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  menu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── CART ───────────────────────────────────────────────────── */
function initCart() {
  const cartOverlay  = document.getElementById('cart-overlay');
  const cartSidebar  = document.getElementById('cart-sidebar');
  const cartClose    = document.getElementById('cart-close');
  const cartBtns     = document.querySelectorAll('[data-open-cart]');
  const cartCountEls = document.querySelectorAll('.cart-count');

  if (!cartSidebar) return;

  function openCart() {
    cartOverlay?.classList.add('open');
    cartSidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartOverlay?.classList.remove('open');
    cartSidebar.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtns.forEach(b => b.addEventListener('click', openCart));
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // Quick add to cart
  document.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const name = card?.querySelector('.product-name')?.textContent || 'Produto';
      const price = card?.querySelector('.product-price')?.dataset.price || '0';
      const img   = card?.querySelector('.product-img');

      window.AmbrosiStore?.addToCart({
        id: card?.dataset.productId || Date.now().toString(),
        name, price: parseFloat(price), image: img?.src || '', qty: 1,
        variant: card?.dataset.variant || '250g'
      });

      showToast('✓ Adicionado ao carrinho');
      updateCartUI();
      openCart();
    });
  });

  // Qty controls
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.cart-item');
      if (!item) return;
      const id  = item.dataset.id;
      const dir = btn.dataset.dir;
      window.AmbrosiStore?.updateQty(id, dir);
      updateCartUI();
    });
  });

  updateCartUI();
}

function updateCartUI() {
  const cart = window.AmbrosiStore?.cart || [];
  const total = cart.reduce((sum, i) => sum + i.qty, 0);

  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });

  const body = document.querySelector('.cart-body');
  const totalEl = document.querySelector('.cart-total-value');

  if (body) {
    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">☕</div>
          <p>O teu carrinho está vazio</p>
        </div>`;
    } else {
      body.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-img">${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover">` : ''}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-variant">${item.variant}</div>
            <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
            <div class="qty-control" style="margin-top:.6rem">
              <button class="qty-btn" data-dir="down">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" data-dir="up">+</button>
            </div>
          </div>
        </div>`).join('');
      initCart(); // rebind qty buttons
    }
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (totalEl) totalEl.textContent = formatPrice(subtotal);
}

function formatPrice(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

/* ── TOAST ──────────────────────────────────────────────────── */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ── PRODUCT FILTERS ────────────────────────────────────────── */
function initProductFilters() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.product-card[data-category]');
  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const cat = pill.dataset.filter;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            opacity: match ? 1 : 0.2,
            scale: match ? 1 : 0.96,
            duration: 0.4,
            ease: 'power2.out',
            pointerEvents: match ? 'auto' : 'none',
          });
        } else {
          card.style.opacity = match ? 1 : 0.2;
        }
      });
    });
  });

  // Sort
  const sortSelect = document.querySelector('.sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const val = sortSelect.value;
      const grid = document.querySelector('.all-products-grid');
      if (!grid) return;
      const items = [...grid.querySelectorAll('.product-card')];
      items.sort((a, b) => {
        const pa = parseFloat(a.dataset.price || 0);
        const pb = parseFloat(b.dataset.price || 0);
        if (val === 'price-asc')  return pa - pb;
        if (val === 'price-desc') return pb - pa;
        return 0;
      });
      items.forEach(item => grid.appendChild(item));
    });
  }
}

/* ── ORIGIN CARDS ───────────────────────────────────────────── */
function initOriginCards() {
  document.querySelectorAll('.origin-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (typeof gsap === 'undefined') return;
      gsap.to(card, { y: -8, duration: 0.4, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      if (typeof gsap === 'undefined') return;
      gsap.to(card, { y: 0, duration: 0.4, ease: 'power2.out' });
    });
  });
}

/* ── FLOATING LEAVES SVG ────────────────────────────────────── */
function generateLeaves() {
  const container = document.querySelector('.tropical-leaves');
  if (!container) return;

  const leafPaths = [
    'M10,80 Q50,-20 90,80 Q50,180 10,80Z',
    'M20,10 Q100,30 80,90 Q10,70 20,10Z',
    'M50,0 Q100,50 50,100 Q0,50 50,0Z',
  ];

  for (let i = 0; i < 12; i++) {
    const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    leaf.setAttribute('viewBox', '0 0 100 100');
    leaf.classList.add('leaf');
    const size = 60 + Math.random() * 120;
    leaf.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      transform: rotate(${Math.random() * 360}deg);
    `;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', leafPaths[i % leafPaths.length]);
    path.setAttribute('fill', '#4A7C59');
    leaf.appendChild(path);
    container.appendChild(leaf);
    leaf.classList.add('leaf');
  }
}
generateLeaves();

/* ── BADGE SVG TEXT ─────────────────────────────────────────── */
function initBadge() {
  const svg = document.querySelector('.hero-badge svg');
  if (!svg) return;
  const text = 'CAFÉ PREMIUM • AMBROSIA • CAFÉ PREMIUM • AMBROSIA • ';
  const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('id', 'badge-circle');
  path.setAttribute('d', 'M 50,50 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0');
  path.setAttribute('fill', 'none');
  const tp = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
  tp.setAttribute('href', '#badge-circle');
  tp.setAttribute('startOffset', '0%');
  tp.textContent = text;
  textPath.setAttribute('font-size', '8.5');
  textPath.setAttribute('fill', '#C8922A');
  textPath.setAttribute('font-family', 'Montserrat, sans-serif');
  textPath.setAttribute('font-weight', '600');
  textPath.setAttribute('letter-spacing', '0.5');
  textPath.appendChild(tp);
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.appendChild(path);
  svg.appendChild(textPath);
}
initBadge();

/* ── EXPOSE HELPERS FOR OTHER SCRIPTS ───────────────────────── */
window.AmbrosiaCoffee = { showToast, updateCartUI, formatPrice };
