/* ============================================================
   AMBROSIA COFFEE — STORE LOGIC
   Product catalog + Cart (ready for Dripshipper API)
   ============================================================ */

const AmbrosiStore = (() => {

  /* ── LOCAL PRODUCT CATALOGUE (static fallback) ────────────── */
  const CATALOGUE = [
    {
      id: 'eth-yirg-01',
      name: 'Etiópia Yirgacheffe',
      origin: 'Etiópia',
      category: 'single-origin',
      description: 'Notas florais de jasmim e cítricas de bergamota, acidez brilhante e acabamento suave como seda.',
      flavor_notes: ['Jasmim', 'Bergamota', 'Chá verde'],
      roast: 'Torra Clara',
      process: 'Lavado',
      altitude: '1.800–2.200m',
      price: 18.90,
      compare_price: null,
      weight_options: ['250g', '500g', '1kg'],
      badge: 'Mais Vendido',
      rating: 4.9,
      review_count: 247,
      images: ['assets/images/eth-yirg.jpg'],
      dripshipper_variant_id: null, // Fill in after connecting Dripshipper
      in_stock: true,
    },
    {
      id: 'col-huila-02',
      name: 'Colômbia Huila',
      origin: 'Colômbia',
      category: 'single-origin',
      description: 'Dulçor de caramelo e amêndoa torrada, com acidez macia e corpo aveludado.',
      flavor_notes: ['Caramelo', 'Amêndoa', 'Maçã verde'],
      roast: 'Torra Média',
      process: 'Lavado',
      altitude: '1.600–2.000m',
      price: 16.90,
      compare_price: 19.90,
      weight_options: ['250g', '500g'],
      badge: 'Oferta',
      rating: 4.8,
      review_count: 183,
      images: ['assets/images/col-huila.jpg'],
      dripshipper_variant_id: null,
      in_stock: true,
    },
    {
      id: 'bra-cerrado-03',
      name: 'Brasil Cerrado',
      origin: 'Brasil',
      category: 'espresso',
      description: 'Corpo cheio com notas de chocolate negro e avelã, ideal para espresso cremoso.',
      flavor_notes: ['Chocolate', 'Avelã', 'Baunilha'],
      roast: 'Torra Escura',
      process: 'Natural',
      altitude: '1.000–1.250m',
      price: 14.90,
      compare_price: null,
      weight_options: ['250g', '500g', '1kg'],
      badge: null,
      rating: 4.7,
      review_count: 312,
      images: ['assets/images/bra-cerrado.jpg'],
      dripshipper_variant_id: null,
      in_stock: true,
    },
    {
      id: 'ken-aa-04',
      name: 'Quénia AA',
      origin: 'Quénia',
      category: 'single-origin',
      description: 'Acidez viva de groselha negra e amora, com uma doçura de açúcar mascavado.',
      flavor_notes: ['Groselha negra', 'Amora', 'Açúcar mascavado'],
      roast: 'Torra Clara',
      process: 'Lavado',
      altitude: '1.700–2.100m',
      price: 22.50,
      compare_price: null,
      weight_options: ['250g', '500g'],
      badge: 'Edição Limitada',
      rating: 5.0,
      review_count: 64,
      images: ['assets/images/ken-aa.jpg'],
      dripshipper_variant_id: null,
      in_stock: true,
    },
    {
      id: 'guat-antigua-05',
      name: 'Guatemala Antigua',
      origin: 'Guatemala',
      category: 'espresso',
      description: 'Fumo suave de cacau e especiarias, com acidez cítrica equilibrada.',
      flavor_notes: ['Cacau', 'Canela', 'Laranja'],
      roast: 'Torra Média-Escura',
      process: 'Lavado',
      altitude: '1.500–1.700m',
      price: 17.50,
      compare_price: null,
      weight_options: ['250g', '500g', '1kg'],
      badge: null,
      rating: 4.6,
      review_count: 98,
      images: ['assets/images/guat-antigua.jpg'],
      dripshipper_variant_id: null,
      in_stock: true,
    },
    {
      id: 'ambrosia-blend-06',
      name: 'Blend Ambrosia',
      origin: 'Blend Multi-origem',
      category: 'blend',
      description: 'A nossa assinatura. Um blend equilibrado criado para ser perfeito a qualquer hora do dia.',
      flavor_notes: ['Chocolate ao leite', 'Frutos secos', 'Mel'],
      roast: 'Torra Média',
      process: 'Misto',
      altitude: 'Vários',
      price: 15.90,
      compare_price: null,
      weight_options: ['250g', '500g', '1kg', '2kg'],
      badge: 'Assinatura',
      rating: 4.9,
      review_count: 521,
      images: ['assets/images/ambrosia-blend.jpg'],
      dripshipper_variant_id: null,
      in_stock: true,
    },
  ];

  /* ── CART STATE ───────────────────────────────────────────── */
  let cart = JSON.parse(localStorage.getItem('ambrosia_cart') || '[]');

  function saveCart() {
    localStorage.setItem('ambrosia_cart', JSON.stringify(cart));
  }

  function addToCart(item) {
    const existing = cart.find(i => i.id === item.id && i.variant === item.variant);
    if (existing) {
      existing.qty = Math.min(existing.qty + (item.qty || 1), 99);
    } else {
      cart.push({ ...item, qty: item.qty || 1 });
    }
    saveCart();
  }

  function removeFromCart(id, variant) {
    cart = cart.filter(i => !(i.id === id && (!variant || i.variant === variant)));
    saveCart();
  }

  function updateQty(id, direction, variant) {
    const item = cart.find(i => i.id === id && (!variant || i.variant === variant));
    if (!item) return;
    if (direction === 'up')   item.qty = Math.min(item.qty + 1, 99);
    if (direction === 'down') {
      item.qty -= 1;
      if (item.qty <= 0) removeFromCart(id, variant);
    }
    saveCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  function getSubtotal() {
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getItemCount() {
    return cart.reduce((sum, i) => sum + i.qty, 0);
  }

  /* ── CATALOGUE HELPERS ────────────────────────────────────── */
  function getAll()            { return CATALOGUE; }
  function getById(id)         { return CATALOGUE.find(p => p.id === id); }
  function getByCategory(cat)  { return CATALOGUE.filter(p => p.category === cat); }
  function getFeatured(n = 3)  { return CATALOGUE.slice(0, n); }

  /* ── PRODUCT CARD RENDERER ────────────────────────────────── */
  function renderProductCard(product) {
    const badgeHtml = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
    return `
    <article class="product-card"
         data-product-id="${product.id}"
         data-category="${product.category}"
         data-price="${product.price}"
         role="listitem">
      <div class="product-img-wrap">
        <div class="img-placeholder">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <span>Foto em breve</span>
        </div>
        ${badgeHtml}
        <div class="product-hover-overlay">
          <span class="product-view-btn">Ver Produto →</span>
        </div>
      </div>
      <div class="product-info">
        <p class="product-origin">${product.origin} · ${product.roast}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-notes">${product.flavor_notes.slice(0,3).join(', ')}</p>
        <div class="product-footer">
          <span class="product-price" data-price="${product.price}">
            ${product.compare_price ? `<s style="font-size:.8em;opacity:.4;margin-right:.25em">${product.compare_price.toFixed(2).replace('.',',')} €</s>` : ''}
            ${product.price.toFixed(2).replace('.',',')} €
          </span>
          <button class="quick-add" aria-label="Adicionar ao carrinho">+</button>
        </div>
      </div>
    </article>`;
  }

  function getPlaceholderGradient(id) {
    const gradients = {
      'eth-yirg-01':    'linear-gradient(135deg,#2d4a3e 0%,#4a7c59 60%,#1e3328 100%)',
      'col-huila-02':   'linear-gradient(135deg,#6b2c0e 0%,#c8922a 60%,#3d2000 100%)',
      'bra-cerrado-03': 'linear-gradient(135deg,#3d2000 0%,#6b4010 60%,#1a0a00 100%)',
      'ken-aa-04':      'linear-gradient(135deg,#1a0a00 0%,#8b4513 50%,#3d2000 100%)',
      'guat-antigua-05':'linear-gradient(135deg,#2d4a3e 0%,#6b2c0e 50%,#1a0a00 100%)',
      'ambrosia-blend-06':'linear-gradient(135deg,#c8922a 0%,#3d2000 50%,#1a0a00 100%)',
    };
    return gradients[id] || 'linear-gradient(135deg,#3d2000,#1a0a00)';
  }

  /* ── RENDER GRIDS ─────────────────────────────────────────── */
  // renderFeaturedGrid intentionally removed — featured cards are
  // static HTML in index.html so they can be styled and managed directly.

  function renderAllProductsGrid() {
    const grid = document.querySelector('.all-products-grid');
    if (!grid) return;
    grid.innerHTML = getAll().map(renderProductCard).join('');
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    renderAllProductsGrid(); // only runs on products.html (no-op on index)
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    getSubtotal,
    getItemCount,
    getAll,
    getById,
    getByCategory,
    getFeatured,
    renderProductCard,
    init,
  };
})();

window.AmbrosiStore = AmbrosiStore;
document.addEventListener('DOMContentLoaded', () => AmbrosiStore.init());
