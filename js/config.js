// Réglages boutique.
//
// Paiement via Shopify : renseigne l'adresse de ta boutique Shopify ci-dessous
// (ex. 'authentic-shits.myshopify.com') et les IDs de variantes dans shopify-variants.js.
// Tant que c'est vide, le site reste en mode démo (récap sans paiement).
// Aucune clé secrète n'est nécessaire : on passe par les liens panier publics de Shopify.

export const SHOPIFY_STORE_DOMAIN = 'qmm0zd-g6.myshopify.com';

export const CHECKOUT_MODE = SHOPIFY_STORE_DOMAIN ? 'shopify' : 'demo';

// Uniquement pour l'affichage du récap en mode démo :
// en mode Shopify, la livraison est calculée par Shopify.
export const FREE_SHIPPING_FROM = 8000; // centimes
export const SHIPPING_COST = 590; // centimes
