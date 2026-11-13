// Mockups produits en SVG avec le vrai logo imprimé dessus, en attendant les photos.
// Quand tu auras tes photos : ajoute `image: 'img/mon-produit.webp'` au produit
// et remplace l'appel à garmentSvg() par une balise <img>.

const SHAPES = {
  tee: '<path d="M62 34 L84 24 Q100 38 116 24 L138 34 L172 64 L152 86 L138 76 L138 178 L62 178 L62 76 L48 86 L28 64 Z"/>',
  hoodie: `
    <path d="M60 46 L82 34 Q100 52 118 34 L140 46 L170 150 L150 156 L140 98 L140 180 L60 180 L60 98 L50 156 L30 150 Z"/>
    <path d="M78 40 Q100 4 122 40 Q100 58 78 40 Z"/>
    <path d="M76 150 L124 150 L128 172 L72 172 Z" opacity="0.85"/>`,
  cap: `
    <path d="M40 124 Q40 58 100 54 Q160 58 160 124 Z"/>
    <path d="M100 124 L184 124 Q178 144 120 140 L100 140 Z"/>`,
};

// Position et taille du logo imprimé (x, y, largeur) selon le type de pièce.
const PRINT = {
  tee: { x: 80, y: 52, w: 40 },
  hoodie: { x: 80, y: 66, w: 40 },
  cap: { x: 84, y: 84, w: 32 },
};

const LOGO_RATIO = 722 / 1000;

const escapeAttr = (text) =>
  String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export function garmentSvg(product, label = '') {
  const shape = SHAPES[product.kind] ?? SHAPES.tee;
  const print = PRINT[product.kind] ?? PRINT.tee;
  const aria = label ? `role="img" aria-label="${escapeAttr(label)}"` : 'aria-hidden="true"';
  return `
    <svg viewBox="0 0 200 200" ${aria} class="garment">
      <g fill="${escapeAttr(product.color)}" stroke="rgb(200 200 196 / 0.25)" stroke-width="1" stroke-linejoin="round">${shape}</g>
      <image href="img/logo-${escapeAttr(product.logo)}.png" x="${print.x}" y="${print.y}"
        width="${print.w}" height="${(print.w * LOGO_RATIO).toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>
    </svg>`;
}
