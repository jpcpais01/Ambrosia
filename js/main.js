/* ============================================================
   AMBROSIA COFFEE — MAIN JS (clean rebuild)
   ============================================================ */

/* ── LOADER ─────────────────────────────────────────────────── */
const loader     = document.getElementById('loader');
const loaderBar  = loader?.querySelector('.loader-bar');
const loaderPct  = loader?.querySelector('.loader-pct');

let pct = 0;
const loadTick = setInterval(() => {
  pct += Math.random() * 20 + 5;
  if (pct >= 100) {
    pct = 100;
    clearInterval(loadTick);
    setTimeout(onLoaded, 300);
  }
  if (loaderBar) loaderBar.style.width = pct + '%';
  if (loaderPct)  loaderPct.textContent = Math.floor(pct) + '%';
}, 80);

function onLoaded() {
  loader?.classList.add('done');
  document.body.style.overflow = '';
  init();
}

if (loader) document.body.style.overflow = 'hidden';
else init();

/* ── INIT ───────────────────────────────────────────────────── */
function init() {
  setupScrollProgress();
  setupLenis();
  setupNav();
  setupHero();
  setupOrigins();
  setupScrollAnimations();
  setupCart();
  setupNewsletter();
  setupCursor();

  // After everything is laid out, refresh ScrollTrigger positions
  if (typeof ScrollTrigger !== 'undefined') {
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }
}

/* ── SCROLL PROGRESS BAR ────────────────────────────────────── */
function setupScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const h   = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.transform = `scaleX(${pct})`;
  }, { passive: true });
}

/* ── LENIS ──────────────────────────────────────────────────── */
let lenis;
function setupLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* ── NAV ────────────────────────────────────────────────────── */
function setupNav() {
  const nav  = document.getElementById('nav');
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');

  // Scrolled state
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile menu
  if (ham && menu) {
    ham.addEventListener('click', () => {
      const open = ham.classList.toggle('open');
      menu.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('.mob-link').forEach(link => {
      link.addEventListener('click', () => {
        ham.classList.remove('open');
        menu.classList.remove('open');
        ham.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });
  }

  // Active link
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── HERO ───────────────────────────────────────────────────── */
function setupHero() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Entrance animation
  const tl = gsap.timeline({ delay: 0.1 });
  tl.from('.hero-eyebrow',  { opacity: 0, y: 15, duration: .7, ease: 'power3.out' })
    .from('.hero-title .line', { y: '105%', opacity: 0, duration: .9, ease: 'power4.out', stagger: .1 }, '-=.4')
    .from('.hero-sub',     { opacity: 0, y: 20, duration: .7, ease: 'power3.out' }, '-=.5')
    .from('.hero-cta > *', { opacity: 0, y: 15, duration: .6, ease: 'power3.out', stagger: .1 }, '-=.4')
    .from('.hero-scroll-hint', { opacity: 0, duration: .6 }, '-=.2');

  // Parallax on hero video
  gsap.to('.hero-media', {
    yPercent: 22,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/* ── ORIGINS HORIZONTAL SCROLL ──────────────────────────────── */
function setupOrigins() {
  const wrap = document.querySelector('.origins-scroll-wrap');
  if (!wrap) return;

  // Drag to scroll
  let startX, startLeft, active = false;

  wrap.addEventListener('mousedown', e => {
    active    = true;
    startX    = e.pageX;
    startLeft = wrap.scrollLeft;
    wrap.classList.add('dragging');
  });
  document.addEventListener('mouseup', () => {
    active = false;
    wrap.classList.remove('dragging');
  });
  document.addEventListener('mousemove', e => {
    if (!active) return;
    e.preventDefault();
    wrap.scrollLeft = startLeft - (e.pageX - startX);
  });

  // Arrow buttons
  const card = wrap.querySelector('.o-card');
  const gap  = 24;
  const step = () => (card ? card.offsetWidth + gap : 300);

  document.querySelector('.o-prev')?.addEventListener('click', () =>
    wrap.scrollBy({ left: -step(), behavior: 'smooth' })
  );
  document.querySelector('.o-next')?.addEventListener('click', () =>
    wrap.scrollBy({ left:  step(), behavior: 'smooth' })
  );
}

/* ── SCROLL ANIMATIONS ──────────────────────────────────────── */
function setupScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Helper: create a from() trigger that fires once when element enters viewport
  function reveal(targets, vars, triggerEl) {
    if (!targets || (targets instanceof NodeList && !targets.length)) return;
    gsap.from(targets, {
      ...vars,
      scrollTrigger: {
        trigger: triggerEl || (targets instanceof NodeList ? targets[0] : targets),
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }

  // Origins section header
  reveal('.origins-head', { opacity: 0, y: 40, duration: .8, ease: 'power3.out' });

  // Origin cards (stagger)
  reveal(
    document.querySelectorAll('.o-card'),
    { opacity: 0, y: 50, duration: .7, ease: 'power3.out', stagger: .12 },
    '.origins-scroll-wrap'
  );

  // Manifesto
  reveal('.manifesto-quote',  { opacity: 0, y: 60, duration: 1.1, ease: 'power4.out' });
  reveal('.manifesto-line',   { opacity: 0, scaleX: 0, duration: .8, ease: 'power3.out', transformOrigin: 'left' });

  // Process
  reveal('.process-head',     { opacity: 0, y: 40, duration: .8, ease: 'power3.out' });
  reveal(
    document.querySelectorAll('.process-step'),
    { opacity: 0, y: 50, duration: .75, ease: 'power3.out', stagger: .18 },
    '.process-steps'
  );

  // Featured products header & cards
  reveal('.featured-head',    { opacity: 0, y: 40, duration: .8, ease: 'power3.out' });
  reveal(
    document.querySelectorAll('.product-card'),
    { opacity: 0, y: 45, duration: .7, ease: 'power3.out', stagger: .14 },
    '.products-grid'
  );

  // Newsletter
  reveal('.newsletter-inner', { opacity: 0, y: 40, duration: .8, ease: 'power3.out' });

  // Footer
  reveal('.footer-top',       { opacity: 0, y: 30, duration: .7, ease: 'power3.out' });
}

/* ── CART ───────────────────────────────────────────────────── */
function setupCart() {
  const overlay = document.getElementById('cart-overlay');
  const sidebar = document.getElementById('cart-sidebar');
  const closeBtn = document.getElementById('cart-close');

  if (!sidebar) return;

  const openCart  = () => { overlay?.classList.add('open'); sidebar.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeCart = () => { overlay?.classList.remove('open'); sidebar.classList.remove('open'); document.body.style.overflow = ''; };

  document.querySelectorAll('[data-open-cart]').forEach(b => b.addEventListener('click', openCart));
  closeBtn?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);

  // Quick-add buttons
  document.querySelectorAll('.quick-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card  = btn.closest('.product-card');
      const name  = card?.querySelector('.product-name')?.textContent || 'Produto';
      const price = parseFloat(card?.dataset.price || 0);
      window.AmbrosiStore?.addToCart({
        id:      card?.dataset.productId || Date.now().toString(),
        name, price, qty: 1,
        variant: '250g',
        image:   '',
      });
      refreshCartUI();
      showToast('✓ Adicionado ao carrinho');
      openCart();
    });
  });

  refreshCartUI();
}

function refreshCartUI() {
  const cart    = window.AmbrosiStore?.cart || [];
  const total   = cart.reduce((s, i) => s + i.qty, 0);
  const badge   = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = total;
    badge.classList.toggle('visible', total > 0);
  }

  const body = document.querySelector('.cart-body');
  const totalEl = document.querySelector('.cart-total-value');

  if (body) {
    body.innerHTML = cart.length
      ? cart.map(item => `
          <div class="cart-item">
            <div class="cart-item-img"></div>
            <div>
              <p class="cart-item-name">${item.name}</p>
              <p class="cart-item-price">${fmtPrice(item.price * item.qty)}</p>
            </div>
          </div>`).join('')
      : `<div class="cart-empty"><div class="cart-empty-icon">☕</div><p>O teu carrinho está vazio</p></div>`;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (totalEl) totalEl.textContent = fmtPrice(subtotal);
}

function fmtPrice(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

/* ── NEWSLETTER ─────────────────────────────────────────────── */
function setupNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = form.querySelector('.nl-input')?.value?.trim();
    if (!val) return;
    showToast('✓ Subscrito com sucesso!');
    form.reset();
  });
}

/* ── TOAST ──────────────────────────────────────────────────── */
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── CURSOR ─────────────────────────────────────────────────── */
function setupCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = ring.style.display = 'none';
    return;
  }

  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * .1;
    ry += (my - ry) * .1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .o-card, .product-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
  });
}

/* ── EXPOSE GLOBALS ─────────────────────────────────────────── */
window.AmbrosiaCoffee = { showToast, refreshCartUI, fmtPrice };
