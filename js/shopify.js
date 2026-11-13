// Checkout Shopify via « cart permalink » :
// https://boutique.myshopify.com/cart/VARIANTE:QTE,VARIANTE:QTE
// Shopify crée le panier et envoie directement le client sur son checkout sécurisé.
import { SHOPIFY_STORE_DOMAIN } from './config.js';
import { SHOPIFY_VARIANTS } from './shopify-variants.js';

const DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
const VARIANT_RE = /^\d+$/;

function variantFor(line) {
  const id = SHOPIFY_VARIANTS[line.id]?.[line.size] ?? '';
  return VARIANT_RE.test(id) ? id : null;
}

/**
 * Construit l'URL de checkout Shopify pour le panier.
 * @param {{id: string, size: string, qty: number}[]} cart
 * @returns {{ ok: true, url: string } | { ok: false, error: string, missing?: string[] }}
 */
export function buildShopifyCheckoutUrl(cart) {
  const domain = SHOPIFY_STORE_DOMAIN.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!DOMAIN_RE.test(domain)) {
    return { ok: false, error: 'Adresse de boutique Shopify invalide dans config.js.' };
  }

  const missing = cart.filter((line) => !variantFor(line)).map((line) => `${line.id} (${line.size})`);
  if (missing.length > 0) {
    return { ok: false, error: 'ID de variante Shopify manquant.', missing };
  }

  const items = cart.map((line) => `${variantFor(line)}:${line.qty}`).join(',');
  return { ok: true, url: `https://${domain}/cart/${items}` };
}
