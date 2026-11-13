// Réglages boutique.
//
// Paiement via Shopify : renseigne l'adresse de ta boutique Shopify ci-dessous
// (ex. 'authentic-shits.myshopify.com') et les IDs de variantes dans shopify-variants.js.
// Tant que c'est vide, le site reste en mode démo (récap sans paiement).
// Aucune clé secrète n'est nécessaire : on passe par les liens panier publics de Shopify.

export const SHOPIFY_STORE_DOMAIN = 'qmm0zd-g6.myshopify.com';

// Code d'accès au site (page d'entrée). On stocke seulement son empreinte SHA-256, pas le code.
// Pour changer le code : dans le Terminal, tape
//   printf '%s' "NOUVEAUCODE" | shasum -a 256
// (en MAJUSCULES, sans espaces) et colle le résultat ci-dessous. Mets '' pour retirer la page d'entrée.
export const ACCESS_CODE_SHA256 = 'd18173715fb71713385ef8eb3660cb395bc669c0fbb85568f688ea48fcae3976';

export const CHECKOUT_MODE = SHOPIFY_STORE_DOMAIN ? 'shopify' : 'demo';

// Uniquement pour l'affichage du récap en mode démo :
// en mode Shopify, la livraison est calculée par Shopify.
export const FREE_SHIPPING_FROM = 8000; // centimes
export const SHIPPING_COST = 590; // centimes
