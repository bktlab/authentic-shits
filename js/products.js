// Catalogue du Authentic Wear S01E01. Prix en centimes pour éviter les erreurs d'arrondi.
// Pour ajouter un produit : copie un bloc, change l'id (unique) et les champs.
// `logo` = version du logo imprimée : 'noir' | 'blanc' | 'rouge' | 'broderie'.
// `image` (optionnel) = photo PNG détourée du vêtement, fond transparent,
//   ex. image: 'img/produits/gsd-tee-cream.png'. Sans `image`, un mockup s'affiche.

export const CURRENCY = 'EUR';

const CLOTHING_SIZES = Object.freeze(['S', 'M', 'L', 'XL']);
const ONE_SIZE = Object.freeze(['TU']); // « TU » = taille unique, doit rester tel quel (variantes Shopify)

export const PRODUCTS = Object.freeze([
  {
    id: 'gsd-hoodie-black',
    name: 'GSD Hoodie',
    colorName: 'Black',
    tagline: 'Heavy fleece, boxy oversized fit. GSD Authentic logo screen-printed on the chest.',
    material: '450 GSM fleece',
    fit: 'Oversized',
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
    tagline: 'Organic cotton, boxy fit. Red GSD logo.',
    material: '240 GSM organic cotton',
    fit: 'Boxy',
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
    tagline: 'Organic cotton, boxy fit. White GSD logo.',
    material: '240 GSM organic cotton',
    fit: 'Boxy',
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
    tagline: 'Heavy fleece, boxy oversized fit. Two-tone embroidered logo.',
    material: '450 GSM fleece',
    fit: 'Oversized',
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
    tagline: 'Organic cotton, boxy fit. White GSD logo.',
    material: '240 GSM organic cotton',
    fit: 'Boxy',
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
    tagline: 'Organic cotton, boxy fit. White GSD logo.',
    material: '240 GSM organic cotton',
    fit: 'Boxy',
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
    tagline: '6-panel cap, embroidered logo, adjustable strap.',
    material: 'Cotton twill',
    fit: 'One size',
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
    tagline: 'Organic cotton, boxy fit. White GSD logo.',
    material: '240 GSM organic cotton',
    fit: 'Boxy',
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
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: CURRENCY }).format(cents / 100);
}
