import { PRODUCTS, findProduct, formatPrice, productTitle } from './products.js';
import { loadCart, saveCart, addItem, setQty, cartCount, cartTotal } from './cart.js';
import { productVisual } from './garment.js';
import { CHECKOUT_MODE, FREE_SHIPPING_FROM, SHIPPING_COST } from './config.js';
import { buildShopifyCheckoutUrl } from './shopify.js';

const TOAST_MS = 2200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

let cart = loadCart();
let currentProduct = null;

/* ---------- Annonces produits ---------- */
const CATEGORY_LABELS = Object.freeze({ all: 'Tout', hoodie: 'Hoodies', tee: 'T-shirts', cap: 'Casquettes' });

const listingId = (product) =>
  `GSD-${String(PRODUCTS.indexOf(product) + 1).padStart(4, '0')}`;

function renderCategories(active) {
  const counts = PRODUCTS.reduce((acc, p) => ({ ...acc, [p.kind]: (acc[p.kind] ?? 0) + 1 }), {});
  $('[data-categories]').innerHTML = Object.entries(CATEGORY_LABELS).map(([key, label]) => `
    <li>
      <button type="button" data-filter="${key}" aria-pressed="${key === active}">
        ${escapeHtml(label)} <span>(${key === 'all' ? PRODUCTS.length : counts[key] ?? 0})</span>
      </button>
    </li>`).join('');
}

function renderListing(product) {
  const status = product.soldOut
    ? '<span class="tag tag-out">Épuisé</span>'
    : '<span class="tag tag-in">Disponible</span>';
  return `
    <li>
      <button class="product-card ${product.soldOut ? 'is-sold-out' : ''}" type="button"
        data-open-product="${escapeHtml(product.id)}">
        <span class="card-visual">${productVisual(product)}</span>
        <span class="card-info">
          <span class="card-title">${escapeHtml(productTitle(product))}</span>
          <span class="card-meta"><span>Annonce</span><span class="mono">#${listingId(product)}</span></span>
          <span class="card-meta"><span>Vendeur</span><span>authentic_shits <span class="verified">✓</span></span></span>
          <span class="card-meta"><span>Expédié de</span><span>FR → Monde</span></span>
          <span class="card-meta"><span>Statut</span>${status}</span>
          <span class="card-price mono">${formatPrice(product.price)}</span>
        </span>
      </button>
    </li>`;
}

function renderProducts(filter = 'all') {
  const visible = filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.kind === filter);
  $('[data-product-grid]').innerHTML = visible.map(renderListing).join('');
  $('[data-result-count]').textContent = `${visible.length} annonce${visible.length > 1 ? 's' : ''}`;
  renderCategories(filter);
}

function handleFilterClick(event) {
  const button = event.target.closest('[data-filter]');
  if (button && button.dataset.filter in CATEGORY_LABELS) renderProducts(button.dataset.filter);
}

/* ---------- Fiche produit ---------- */
function openProduct(id) {
  const product = findProduct(id);
  if (!product) return;
  currentProduct = product;
  const isSingleSize = product.sizes.length === 1 && !product.soldOut;

  $('[data-pd-visual]').innerHTML = productVisual(product, productTitle(product));
  $('[data-pd-name]').textContent = productTitle(product);
  $('[data-pd-price]').textContent = formatPrice(product.price);
  $('[data-pd-tagline]').textContent = product.tagline;
  $('[data-pd-sizes]').innerHTML = product.sizes.map((size) => `
    <label>
      <input type="radio" name="size" value="${escapeHtml(size)}"
        ${isSingleSize ? 'checked' : ''} ${product.soldOut ? 'disabled' : ''}>
      <span>${escapeHtml(size)}</span>
    </label>`).join('');

  updateAddButton();
  $('[data-product-dialog]').showModal();
}

function selectedSize() {
  return $('[data-pd-sizes] input:checked')?.value ?? null;
}

function updateAddButton() {
  const button = $('[data-pd-add]');
  const size = selectedSize();
  button.disabled = currentProduct.soldOut || !size;
  if (currentProduct.soldOut) button.textContent = 'Sold out';
  else button.textContent = size ? 'Ajouter au bag' : 'Choisis ta taille';
}

function handleAddToCart() {
  const size = selectedSize();
  if (!currentProduct || currentProduct.soldOut || !size) return;
  commitCart(addItem(cart, currentProduct.id, size));
  $('[data-product-dialog]').close();
  bumpCount();
  showToast(`${productTitle(currentProduct)} (${size}) ajouté`);
}

/* ---------- Panier ---------- */
function commitCart(nextCart) {
  cart = nextCart;
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const count = cartCount(cart);
  const isEmpty = count === 0;
  $('[data-cart-count]').textContent = String(count);
  $('[data-cart-total]').textContent = formatPrice(cartTotal(cart));
  $('[data-cart-empty]').hidden = !isEmpty;
  $('[data-checkout]').disabled = isEmpty;
  $('[data-checkout]').textContent = 'Checkout';
  $('[data-cart-lines]').innerHTML = cart.map(renderCartLine).join('');
}

function renderCartLine(line) {
  const product = findProduct(line.id);
  const key = `data-id="${escapeHtml(line.id)}" data-size="${escapeHtml(line.size)}"`;
  return `
    <li class="cart-line">
      <span class="thumb">${productVisual(product)}</span>
      <div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.colorName)} · Taille ${escapeHtml(line.size)} · ${formatPrice(product.price)}</p>
      </div>
      <div class="qty" aria-label="Quantité ${escapeHtml(productTitle(product))}">
        <button type="button" data-qty="-1" ${key} aria-label="Retirer un">−</button>
        <output>${line.qty}</output>
        <button type="button" data-qty="1" ${key} aria-label="Ajouter un">+</button>
      </div>
    </li>`;
}

function handleQtyClick(event) {
  const button = event.target.closest('[data-qty]');
  if (!button) return;
  const { id, size } = button.dataset;
  const line = cart.find((item) => item.id === id && item.size === size);
  if (!line) return;
  commitCart(setQty(cart, id, size, line.qty + Number(button.dataset.qty)));
}

function setCartOpen(isOpen) {
  const drawer = $('#cart');
  drawer.classList.toggle('is-open', isOpen);
  drawer.setAttribute('aria-hidden', String(!isOpen));
  drawer.inert = !isOpen;
  $('[data-scrim]').hidden = !isOpen;
  $('.cart-toggle').setAttribute('aria-expanded', String(isOpen));
  if (isOpen) $('[data-cart-close]').focus();
  else $('.cart-toggle').focus();
}

/* ---------- Checkout ---------- */
function handleCheckout() {
  if (cart.length === 0) return;
  if (CHECKOUT_MODE === 'shopify') {
    goToShopifyCheckout();
    return;
  }
  showDemoRecap();
}

function goToShopifyCheckout() {
  const result = buildShopifyCheckoutUrl(cart);
  if (!result.ok) {
    console.error('Checkout Shopify impossible :', result.error, result.missing ?? '');
    showToast('Checkout indisponible pour le moment. Réessaie plus tard.');
    return;
  }
  const button = $('[data-checkout]');
  button.disabled = true;
  button.textContent = 'Redirection…';
  window.location.assign(result.url);
}

function showDemoRecap() {
  const subtotal = cartTotal(cart);
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  const lines = cart.map((line) => {
    const product = findProduct(line.id);
    return `<li><span>${line.qty}× ${escapeHtml(productTitle(product))} (${escapeHtml(line.size)})</span>
      <strong>${formatPrice(product.price * line.qty)}</strong></li>`;
  }).join('');

  $('[data-checkout-body]').innerHTML = `
    <ul>
      ${lines}
      <li><span>Livraison</span><strong>${shipping === 0 ? 'Offerte' : formatPrice(shipping)}</strong></li>
      <li><span>Total</span><strong>${formatPrice(subtotal + shipping)}</strong></li>
    </ul>
    <p class="checkout-note">Mode démo : la boutique Shopify n'est pas encore reliée. Aucune commande n'a été passée.</p>`;
  $('[data-checkout-dialog]').showModal();
}

/* ---------- Newsletter ---------- */
function handleNewsletter(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const msg = $('[data-newsletter-msg]');
  const email = form.email.value.trim();
  const isValid = EMAIL_RE.test(email);
  msg.classList.toggle('is-error', !isValid);
  if (!isValid) {
    msg.textContent = 'Adresse e-mail invalide.';
    form.email.focus();
    return;
  }
  // À brancher sur ton outil d'e-mailing (Brevo, Mailchimp, Klaviyo…).
  msg.textContent = 'Inscription enregistrée. (démo : rien n\'est encore envoyé)';
  form.reset();
}

/* ---------- UI helpers ---------- */
let toastTimer;
function showToast(text) {
  const toast = $('[data-toast]');
  toast.textContent = text;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), TOAST_MS);
}

function bumpCount() {
  const badge = $('.cart-toggle');
  badge.classList.remove('bump');
  void badge.offsetWidth; // relance l'animation
  badge.classList.add('bump');
}

/* ---------- Init ---------- */
function bindEvents() {
  $('[data-product-grid]').addEventListener('click', (event) => {
    const card = event.target.closest('[data-open-product]');
    if (card) openProduct(card.dataset.openProduct);
  });
  $('[data-categories]').addEventListener('click', handleFilterClick);
  $('[data-pd-sizes]').addEventListener('change', updateAddButton);
  $('[data-pd-add]').addEventListener('click', handleAddToCart);
  $('.cart-toggle').addEventListener('click', () => setCartOpen(true));
  $('[data-cart-close]').addEventListener('click', () => setCartOpen(false));
  $('[data-scrim]').addEventListener('click', () => setCartOpen(false));
  $('[data-cart-lines]').addEventListener('click', handleQtyClick);
  $('[data-checkout]').addEventListener('click', handleCheckout);
  $('[data-newsletter]').addEventListener('submit', handleNewsletter);
  // Retour arrière depuis le checkout Shopify : on réactive le bouton.
  window.addEventListener('pageshow', (event) => { if (event.persisted) renderCart(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('#cart').classList.contains('is-open')) setCartOpen(false);
  });
}

$('[data-year]').textContent = String(new Date().getFullYear());
renderProducts();
renderCart();
bindEvents();
