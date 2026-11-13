// Catalogue du Drop 01. Prix en centimes pour éviter les erreurs d'arrondi.
// Pour ajouter un produit : copie un bloc, change l'id (unique) et les champs.
// `logo` = version du logo imprimée : 'noir' | 'blanc' | 'rouge' | 'broderie'.

export const CURRENCY = 'EUR';

const CLOTHING_SIZES = Object.freeze(['S', 'M', 'L', 'XL']);
const ONE_SIZE = Object.freeze(['TU']);

export const PRODUCTS = Object.freeze([
  {
    id: 'gsd-hoodie-black',
    name: 'GSD Hoodie',
    colorName: 'Black',
    tagline: 'Molleton 450g, coupe large. Logo GSD Authentic sérigraphié poitrine.',
    price: 7500,
    kind: 'hoodie',
    color: '#151515',
    logo: 'blanc',
    sizes: CLOTHING_SIZES,
  },
  {
    id: 'gsd-tee-cream',
    name: 'GSD Tee',
    colorName: 'Cream',
    tagline: 'Coton bio 240g, coupe carrée. Logo rouge.',
    price: 3500,
    kind: 'tee',
    color: '#ece6da',
    logo: 'rouge',
    sizes: CLOTHING_SIZES,
  },
  {
    id: 'gsd-tee-black',
    name: 'GSD Tee',
    colorName: 'Black',
    tagline: 'Coton bio 240g, coupe carrée. Logo blanc.',
    price: 3500,
    kind: 'tee',
    color: '#151515',
    logo: 'blanc',
    sizes: CLOTHING_SIZES,
  },
  {
    id: 'gsd-hoodie-grey',
    name: 'GSD Hoodie',
    colorName: 'Heather Grey',
    tagline: 'Molleton 450g, coupe large. Logo brodé 2 couleurs.',
    price: 7900,
    kind: 'hoodie',
    color: '#9a9c9e',
    logo: 'broderie',
    sizes: CLOTHING_SIZES,
    soldOut: true,
  },
  {
    id: 'gsd-tee-red',
    name: 'GSD Tee',
    colorName: 'Red',
    tagline: 'Coton bio 240g, coupe carrée. Logo blanc.',
    price: 3500,
    kind: 'tee',
    color: '#8e1c1c',
    logo: 'blanc',
    sizes: CLOTHING_SIZES,
  },
  {
    id: 'gsd-tee-green',
    name: 'GSD Tee',
    colorName: 'Forest',
    tagline: 'Coton bio 240g, coupe carrée. Logo blanc.',
    price: 3500,
    kind: 'tee',
    color: '#2f4a33',
    logo: 'blanc',
    sizes: CLOTHING_SIZES,
  },
  {
    id: 'gsd-cap-black',
    name: 'GSD Cap',
    colorName: 'Black',
    tagline: '6 panneaux, logo brodé, sangle réglable.',
    price: 3000,
    kind: 'cap',
    color: '#151515',
    logo: 'blanc',
    sizes: ONE_SIZE,
  },
  {
    id: 'gsd-tee-purple',
    name: 'GSD Tee',
    colorName: 'Purple',
    tagline: 'Coton bio 240g, coupe carrée. Logo blanc.',
    price: 3500,
    kind: 'tee',
    color: '#4a2f5e',
    logo: 'blanc',
    sizes: CLOTHING_SIZES,
  },
]);

export function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id) ?? null;
}

export function productTitle(product) {
  return `${product.name} — ${product.colorName}`;
}

export function formatPrice(cents) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: CURRENCY }).format(cents / 100);
}
