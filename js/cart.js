// Panier : fonctions pures (jamais de mutation) + persistance localStorage.
import { findProduct } from './products.js';

const STORAGE_KEY = 'as-cart-v1';
export const MAX_QTY = 10;

export function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isValidLine) : [];
  } catch (error) {
    console.warn('Panier illisible, on repart à zéro.', error);
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn('Impossible de sauvegarder le panier.', error);
  }
}

function isValidLine(line) {
  const product = line && findProduct(line.id);
  return Boolean(product)
    && product.sizes.includes(line.size)
    && Number.isInteger(line.qty)
    && line.qty > 0
    && line.qty <= MAX_QTY;
}

const sameLine = (a, b) => a.id === b.id && a.size === b.size;

export function addItem(cart, id, size) {
  const target = { id, size };
  const existing = cart.find((line) => sameLine(line, target));
  if (!existing) return [...cart, { id, size, qty: 1 }];
  return cart.map((line) =>
    sameLine(line, target) ? { ...line, qty: Math.min(line.qty + 1, MAX_QTY) } : line,
  );
}

export function setQty(cart, id, size, qty) {
  const target = { id, size };
  if (qty <= 0) return cart.filter((line) => !sameLine(line, target));
  return cart.map((line) =>
    sameLine(line, target) ? { ...line, qty: Math.min(qty, MAX_QTY) } : line,
  );
}

export function cartCount(cart) {
  return cart.reduce((sum, line) => sum + line.qty, 0);
}

export function cartTotal(cart) {
  return cart.reduce((sum, line) => sum + (findProduct(line.id)?.price ?? 0) * line.qty, 0);
}
