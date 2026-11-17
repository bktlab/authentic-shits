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
export const ACCESS_CODE_SHA256 = 'cbc86fb19d05603762d6b9144c4e6e939d30820d9ee93746ca7bf29e2e459496';

// Fin du drop (compte à rebours dans le bandeau rouge), en heure UTC.
// Exemple : '2026-12-20T20:00:00Z'. Laisse '' pour afficher « Drop 01 — out now ».
export const DROP_ENDS_AT = '2026-11-22T22:59:00Z'; // dimanche 22 nov. 23h59, heure de Paris

export const CHECKOUT_MODE = SHOPIFY_STORE_DOMAIN ? 'shopify' : 'demo';

// Uniquement pour l'affichage du récap en mode démo :
// en mode Shopify, la livraison est calculée par Shopify.
export const FREE_SHIPPING_FROM = 8000; // centimes
export const SHIPPING_COST = 590; // centimes
