// Correspondance produit du site → ID de variante Shopify (un par taille).
// Où trouver l'ID : Shopify admin → Produits → ton produit → clique une variante (ex. « M »).
// L'URL finit par /variants/123456789 : copie ce nombre entre guillemets.
// Voir SHOPIFY.md pour le pas-à-pas.

export const SHOPIFY_VARIANTS = Object.freeze({
  'gsd-hoodie-black': { S: '60205803700549', M: '60205803733317', L: '60205803766085', XL: '60205803798853' },
  'gsd-tee-cream': { S: '60205804192069', M: '60205804224837', L: '60205804257605', XL: '60205804290373' },
  'gsd-tee-black': { S: '60205804388677', M: '60205804421445', L: '60205804454213', XL: '60205804486981' },
  'gsd-hoodie-grey': { S: '60205804552517', M: '60205804585285', L: '60205804618053', XL: '60205804650821' },
  'gsd-tee-red': { S: '60205804716357', M: '60205804749125', L: '60205804781893', XL: '60205804814661' },
  'gsd-tee-green': { S: '60205804880197', M: '60205804912965', L: '60205804945733', XL: '60205804978501' },
  'gsd-cap-black': { TU: '60205805044037' },
  'gsd-tee-purple': { S: '60205805109573', M: '60205805142341', L: '60205805175109', XL: '60205805207877' },
});
