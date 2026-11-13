# Brancher le paiement Shopify

Le site garde son design. Au clic sur **Checkout**, le client est envoyé sur le
checkout sécurisé de Shopify avec son panier déjà rempli. Shopify gère le paiement
(CB, Apple Pay, PayPal…), la livraison, les taxes, les e-mails de commande et le stock.

## 1. Créer la boutique Shopify

1. Crée un compte sur shopify.com (essai gratuit, puis un plan payant pour encaisser).
2. **Paramètres → Paiements** : active Shopify Payments (ou PayPal).
3. **Paramètres → Expédition et livraison** : mets tes tarifs (ex. livraison offerte dès 80 €,
   comme annoncé sur le site).
4. Retire le mot de passe de la boutique quand tu es prêt à vendre
   (**Boutique en ligne → Préférences**), sinon les clients ne pourront pas payer.

## 2. Créer les produits

Pour chaque produit du site, crée un produit Shopify avec une option **Taille**
(S, M, L, XL — ou une seule variante pour la casquette). Mets le prix et le stock.

| Produit du site          | ID dans le code    |
|--------------------------|--------------------|
| GSD Hoodie — Black       | `gsd-hoodie-black` |
| GSD Tee — Cream          | `gsd-tee-cream`    |
| GSD Tee — Black          | `gsd-tee-black`    |
| GSD Hoodie — Heather Grey| `gsd-hoodie-grey`  |
| GSD Tee — Red            | `gsd-tee-red`      |
| GSD Tee — Forest         | `gsd-tee-green`    |
| GSD Cap — Black          | `gsd-cap-black`    |
| GSD Tee — Purple         | `gsd-tee-purple`   |

## 3. Récupérer les IDs de variantes

Dans l'admin Shopify : **Produits → le produit → clique sur la variante (ex. « M »)**.
L'adresse de la page finit par `/variants/44123456789012` : ce nombre est l'ID.

Colle-le dans `js/shopify-variants.js` :

```js
'gsd-tee-cream': { S: '44123456789011', M: '44123456789012', L: '…', XL: '…' },
```

## 4. Relier le site à la boutique

Dans `js/config.js`, mets l'adresse `.myshopify.com` de ta boutique :

```js
export const SHOPIFY_STORE_DOMAIN = 'authentic-shits.myshopify.com';
```

C'est tout. Pas de clé secrète, rien de sensible dans le code.

## Bon à savoir

- **Prix et stock** : c'est Shopify qui fait foi au checkout. Si tu changes un prix,
  change-le aussi dans `js/products.js` pour que le site affiche le même.
- **Sold out** : mets `soldOut: true` sur le produit dans `js/products.js`.
- **Commandes** : elles arrivent dans l'admin Shopify (et l'appli mobile Shopify).
- Plus tard, on peut faire lire les prix et le stock directement depuis Shopify
  (Storefront API) pour ne plus rien recopier à la main.
