/* ============================================================
   AMBROSIA COFFEE — DRIPSHIPPER API INTEGRATION LAYER

   To activate:
   1. Get your Dripshipper API key from your dashboard
   2. Set DRIPSHIPPER_API_KEY in your environment / config
   3. Set USE_DRIPSHIPPER = true
   4. Map your product IDs to Dripshipper variant IDs in the catalogue
   ============================================================ */

const DripshipperAPI = (() => {

  /* ── CONFIG ─────────────────────────────────────────────── */
  const USE_DRIPSHIPPER = false; // Flip to true when ready
  const API_BASE = 'https://www.dripshipper.io/api';
  // IMPORTANT: Never expose the API key in client-side code in production.
  // Use a server-side proxy (Netlify Functions, Vercel Edge, etc.)
  const PROXY_BASE = '/api/dripshipper'; // Your server-side proxy endpoint

  /* ── PRODUCT METHODS ─────────────────────────────────────── */

  /**
   * Fetch product catalogue from Dripshipper.
   * Returns array of products normalized to Ambrosia format.
   */
  async function fetchProducts() {
    if (!USE_DRIPSHIPPER) return null;
    try {
      const res = await fetch(`${PROXY_BASE}/products`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
      const data = await res.json();
      return normalizeProducts(data.products || data);
    } catch (err) {
      console.warn('[Dripshipper] fetchProducts error:', err);
      return null; // Falls back to local catalogue
    }
  }

  /**
   * Normalize Dripshipper product format → Ambrosia internal format
   */
  function normalizeProducts(products) {
    return products.map(p => ({
      id: `ds-${p.id}`,
      name: p.title,
      origin: extractMetafield(p, 'origin') || 'Origem Especial',
      category: extractMetafield(p, 'category') || 'single-origin',
      description: p.body_html?.replace(/<[^>]*>/g, '') || '',
      flavor_notes: extractMetafield(p, 'flavor_notes')?.split(',').map(s => s.trim()) || [],
      roast: extractMetafield(p, 'roast') || 'Torra Média',
      process: extractMetafield(p, 'process') || 'Lavado',
      altitude: extractMetafield(p, 'altitude') || '',
      price: parseFloat(p.variants?.[0]?.price || 0),
      compare_price: p.variants?.[0]?.compare_at_price
        ? parseFloat(p.variants[0].compare_at_price) : null,
      weight_options: p.variants?.map(v => v.title) || ['250g'],
      badge: extractMetafield(p, 'badge') || null,
      rating: 4.8,
      review_count: 0,
      images: p.images?.map(i => i.src) || [],
      dripshipper_product_id: p.id,
      dripshipper_variant_id: p.variants?.[0]?.id || null,
      in_stock: p.variants?.some(v => v.inventory_quantity > 0) ?? true,
    }));
  }

  function extractMetafield(product, key) {
    return product.metafields?.find(m => m.key === key)?.value || null;
  }

  /* ── ORDER / CHECKOUT METHODS ────────────────────────────── */

  /**
   * Create a Dripshipper order from cart items.
   * Call this when user clicks "Finalizar Compra".
   *
   * @param {Object} params
   * @param {Array}  params.items     - Cart items [{id, qty, dripshipper_variant_id, ...}]
   * @param {Object} params.customer  - Customer info
   * @param {Object} params.shipping  - Shipping address
   * @returns {Promise<Object>}       - { success, order_id, checkout_url }
   */
  async function createOrder({ items, customer, shipping }) {
    if (!USE_DRIPSHIPPER) {
      console.info('[Dripshipper] Running in demo mode — order not submitted.');
      return { success: false, demo: true, message: 'Demo mode ativo' };
    }

    const lineItems = items.map(item => ({
      variant_id: item.dripshipper_variant_id,
      quantity: item.qty,
    })).filter(i => i.variant_id);

    try {
      const res = await fetch(`${PROXY_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            line_items: lineItems,
            customer: {
              first_name: customer.firstName,
              last_name:  customer.lastName,
              email:      customer.email,
              phone:      customer.phone,
            },
            shipping_address: {
              first_name: customer.firstName,
              last_name:  customer.lastName,
              address1:   shipping.address1,
              address2:   shipping.address2 || '',
              city:       shipping.city,
              province:   shipping.province || '',
              zip:        shipping.zip,
              country:    shipping.country || 'PT',
              phone:      customer.phone,
            },
          }
        })
      });

      if (!res.ok) throw new Error(`Order creation failed: ${res.status}`);
      const data = await res.json();
      return {
        success: true,
        order_id: data.order?.id,
        checkout_url: data.checkout_url || data.order?.checkout_url,
      };
    } catch (err) {
      console.error('[Dripshipper] createOrder error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get shipping rates for the current cart + address.
   */
  async function getShippingRates({ items, address }) {
    if (!USE_DRIPSHIPPER) return getDemoShippingRates();

    try {
      const res = await fetch(`${PROXY_BASE}/shipping-rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, address })
      });
      if (!res.ok) throw new Error(`Shipping rates fetch failed: ${res.status}`);
      const data = await res.json();
      return normalizeShippingRates(data.shipping_rates || data);
    } catch (err) {
      console.warn('[Dripshipper] getShippingRates error:', err);
      return getDemoShippingRates();
    }
  }

  function normalizeShippingRates(rates) {
    return rates.map(r => ({
      id: r.id,
      name: r.title,
      price: parseFloat(r.price),
      currency: r.currency || 'EUR',
      estimated_days: r.min_delivery_date
        ? Math.ceil((new Date(r.min_delivery_date) - Date.now()) / 86400000) : null,
    }));
  }

  function getDemoShippingRates() {
    return [
      { id: 'standard', name: 'Envio Standard (3–5 dias)', price: 3.90, currency: 'EUR', estimated_days: 4 },
      { id: 'express',  name: 'Envio Expresso (1–2 dias)', price: 7.90, currency: 'EUR', estimated_days: 1 },
      { id: 'free',     name: 'Envio Grátis (acima de 35€)',price: 0,   currency: 'EUR', estimated_days: 5 },
    ];
  }

  /**
   * Track an existing order by ID.
   */
  async function trackOrder(orderId) {
    if (!USE_DRIPSHIPPER) return null;
    try {
      const res = await fetch(`${PROXY_BASE}/orders/${orderId}/tracking`);
      if (!res.ok) throw new Error(`Tracking fetch failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[Dripshipper] trackOrder error:', err);
      return null;
    }
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  async function init() {
    if (!USE_DRIPSHIPPER) return;

    const products = await fetchProducts();
    if (products && window.AmbrosiStore) {
      // Override local catalogue with live Dripshipper data
      console.info('[Dripshipper] Loaded', products.length, 'products from API');
      // window.AmbrosiStore.setCatalogue(products); // Uncomment when ready
    }
  }

  return {
    init,
    fetchProducts,
    createOrder,
    getShippingRates,
    trackOrder,
    USE_DRIPSHIPPER,
  };
})();

window.DripshipperAPI = DripshipperAPI;
document.addEventListener('DOMContentLoaded', () => DripshipperAPI.init());
