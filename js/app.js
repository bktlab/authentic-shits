import { PRODUCTS, findProduct, formatPrice, productTitle } from './products.js?v=29';
import { loadCart, saveCart, addItem, setQty, cartCount, cartTotal } from './cart.js?v=29';
import { productVisual } from './garment.js?v=29';
import { CHECKOUT_MODE, FREE_SHIPPING_FROM, SHIPPING_COST, DROP_STARTS_AT } from './config.js?v=29';
import { buildShopifyCheckoutUrl } from './shopify.js?v=29';
import { initGate } from './gate.js?v=29';

const TOAST_MS = 2200;
const TICK_MS = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

let cart = loadCart();
let currentProduct = null;

/* ---------- Produits ---------- */
const CATEGORY_LABELS = Object.freeze({ all: 'All', hoodie: 'Hoodies', tee: 'T-shirts', cap: 'Caps' });

const sizeLabel = (size) => (size === 'TU' ? 'One size' : size);

function renderCategories(active) {
  $('[data-categories]').innerHTML = Object.entries(CATEGORY_LABELS).map(([key, label]) => `
    <li><button type="button" class="link-line" data-filter="${key}" aria-pressed="${key === active}">${escapeHtml(label)}</button></li>`).join('');
}

function renderListing(product) {
  const price = product.soldOut ? 'Sold out' : formatPrice(product.price);
  return `
    <li>
      <button class="product-card ${product.soldOut ? 'is-sold-out' : ''}" type="button"
        data-open-product="${escapeHtml(product.id)}">
        <span class="card-visual">${productVisual(product)}</span>
        <span class="card-name">${escapeHtml(productTitle(product))}</span>
        <span class="card-price">${price}</span>
      </button>
    </li>`;
}

function renderProducts(filter = 'all') {
  const visible = filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.kind === filter);
  $('[data-product-grid]').innerHTML = visible.map(renderListing).join('');
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
  $('[data-pd-specs]').innerHTML = renderSpecs(product);
  $('[data-pd-sizes]').innerHTML = product.sizes.map((size) => `
    <label>
      <input type="radio" name="size" value="${escapeHtml(size)}"
        ${isSingleSize ? 'checked' : ''} ${product.soldOut ? 'disabled' : ''}>
      <span>${escapeHtml(sizeLabel(size))}</span>
    </label>`).join('');

  updateAddButton();
  $('[data-product-dialog]').showModal();
}

function renderSpecs(product) {
  const rows = [
    ['Material', product.material],
    ['Fit', product.fit],
    ['Ships from', 'France'],
  ];
  return rows.map(([label, value]) =>
    `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
}

function selectedSize() {
  return $('[data-pd-sizes] input:checked')?.value ?? null;
}

function updateAddButton() {
  const button = $('[data-pd-add]');
  const size = selectedSize();
  button.disabled = currentProduct.soldOut || !size;
  if (currentProduct.soldOut) button.textContent = 'Sold out';
  else button.textContent = size ? 'Add to cart' : 'Pick a size';
}

function handleAddToCart() {
  const size = selectedSize();
  if (!currentProduct || currentProduct.soldOut || !size) return;
  commitCart(addItem(cart, currentProduct.id, size));
  $('[data-product-dialog]').close();
  bumpCount();
  showToast(`${productTitle(currentProduct)} (${sizeLabel(size)}) added`);
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
        <p>${escapeHtml(product.colorName)} · ${escapeHtml(sizeLabel(line.size))} · ${formatPrice(product.price)}</p>
      </div>
      <div class="qty" aria-label="Quantity ${escapeHtml(productTitle(product))}">
        <button type="button" data-qty="-1" ${key} aria-label="Remove one">−</button>
        <output>${line.qty}</output>
        <button type="button" data-qty="1" ${key} aria-label="Add one">+</button>
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
    showToast('Checkout unavailable right now. Try again later.');
    return;
  }
  const button = $('[data-checkout]');
  button.disabled = true;
  button.textContent = 'Redirecting…';
  window.location.assign(result.url);
}

function showDemoRecap() {
  const subtotal = cartTotal(cart);
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  const lines = cart.map((line) => {
    const product = findProduct(line.id);
    return `<li><span>${line.qty}× ${escapeHtml(productTitle(product))} (${escapeHtml(sizeLabel(line.size))})</span>
      <strong>${formatPrice(product.price * line.qty)}</strong></li>`;
  }).join('');

  $('[data-checkout-body]').innerHTML = `
    <ul>
      ${lines}
      <li><span>Shipping</span><strong>${shipping === 0 ? 'Free' : formatPrice(shipping)}</strong></li>
      <li><span>Total</span><strong>${formatPrice(subtotal + shipping)}</strong></li>
    </ul>
    <p class="checkout-note">Demo mode: the Shopify store isn't connected yet. No order was placed.</p>`;
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
    msg.textContent = 'Invalid email address.';
    form.email.focus();
    return;
  }
  // À brancher sur ton outil d'e-mailing (Brevo, Mailchimp, Klaviyo…).
  msg.textContent = 'You’re on the list.';
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

/* ---------- Compte à rebours du drop ---------- */
const pad = (n) => String(n).padStart(2, '0');

function countdownParts(msLeft) {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  return [
    [Math.floor(total / 86400), 'Days'],
    [Math.floor(total / 3600) % 24, 'Hrs'],
    [Math.floor(total / 60) % 60, 'Min'],
    [total % 60, 'Sec'],
  ];
}

function startCountdown() {
  const start = Date.parse(DROP_STARTS_AT);
  if (!DROP_STARTS_AT || Number.isNaN(start)) return; // pas de date : bandeau statique
  const bar = $('[data-drop-bar]');
  if (start <= Date.now()) return; // drop ouvert : on garde « Drop 01 — out now »
  bar.innerHTML = 'Drop 01 <span class="sep">—</span> 14.02 <span class="sep">—</span> in <span class="countdown" role="timer" aria-live="off"></span>';
  const box = bar.querySelector('.countdown');
  const tick = () => {
    const msLeft = start - Date.now();
    if (msLeft <= 0) {
      bar.innerHTML = 'Drop 01 <span class="sep">—</span> out now <span class="sep">—</span> no restock';
      clearInterval(timer);
      return;
    }
    box.innerHTML = countdownParts(msLeft)
      .map(([value, unit]) => `<span><b>${pad(value)}</b><small>${unit}</small></span>`).join('');
  };
  const timer = setInterval(tick, TICK_MS);
  tick();
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
  $('[data-checkout-top]').addEventListener('click', () => setCartOpen(true));
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
initGate();
renderProducts();
renderCart();
bindEvents();
startCountdown();
