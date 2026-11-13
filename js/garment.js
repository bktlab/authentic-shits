// Visuel produit : la photo PNG détourée si elle existe (champ `image` du produit),
// sinon un mockup SVG détaillé (ombrages, plis, coutures) avec le vrai logo imprimé dessus.

const LOGO_RATIO = 722 / 1000;
const DRAWCORD = '#e9e5dc';

let svgCounter = 0;

const escapeAttr = (text) =>
  String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/* ---------- Formes ---------- */
const TEE_BODY = 'M82 28 Q100 44 118 28 L140 35 L172 66 L156 88 L137 76 L138 176 Q100 181 62 176 L63 76 L44 88 L28 66 L60 35 Z';
const HOODIE_BODY = 'M70 50 L130 50 L150 58 L168 150 L170 164 L152 168 L148 154 L140 102 L140 168 L60 168 L60 102 L52 154 L48 168 L30 164 L32 150 L50 58 Z';
const CAP_CROWN = 'M42 120 Q40 62 100 56 Q160 62 158 120 Z';
const CAP_BRIM = 'M38 118 Q100 134 162 118 Q170 142 100 152 Q30 142 38 118 Z';

/* ---------- Détails par pièce (dessinés par-dessus la couleur) ---------- */
function teeDetails() {
  return `
    <path d="M84 29 Q100 23 116 29 Q100 39 84 29 Z" fill="rgb(0 0 0 / 0.45)"/>
    <path d="M82 28 Q100 44 118 28 Q100 50 82 28 Z" fill="rgb(0 0 0 / 0.16)" stroke="rgb(0 0 0 / 0.25)" stroke-width="0.6"/>
    <g fill="none" stroke="rgb(0 0 0 / 0.14)" stroke-width="2" stroke-linecap="round">
      <path d="M70 92 Q78 122 71 152"/><path d="M130 94 Q122 126 129 160"/>
      <path d="M150 70 Q145 78 150 85"/><path d="M50 70 Q55 78 50 85"/>
      <path d="M92 150 Q100 158 112 152"/>
    </g>
    <g fill="none" stroke="rgb(255 255 255 / 0.22)" stroke-width="0.6" stroke-dasharray="2 2">
      <path d="M63 171 Q100 176 137 171"/><path d="M153 83 L139 73"/><path d="M47 83 L61 73"/>
    </g>
    <g fill="none" stroke="rgb(0 0 0 / 0.22)" stroke-width="0.7">
      <path d="M63 76 L63 172"/><path d="M137 76 L137 172"/>
    </g>`;
}

function hoodieDetails() {
  const ribs = Array.from({ length: 13 }, (_, i) => `<path d="M${64 + i * 6} 169 L${64 + i * 6} 180"/>`).join('');
  return `
    <path d="M60 168 L140 168 L140 180 Q100 183 60 180 Z" fill="rgb(0 0 0 / 0.18)"/>
    <g stroke="rgb(0 0 0 / 0.18)" stroke-width="0.8">${ribs}</g>
    <path d="M148 154 L170 150 L172 166 L152 170 Z" fill="rgb(0 0 0 / 0.2)"/>
    <path d="M52 154 L30 150 L28 166 L48 170 Z" fill="rgb(0 0 0 / 0.2)"/>
    <path d="M84 50 Q86 28 100 26 Q114 28 116 50 Q100 60 84 50 Z" fill="rgb(0 0 0 / 0.55)"/>
    <path d="M84 50 Q86 28 100 26 Q114 28 116 50" fill="none" stroke="rgb(0 0 0 / 0.3)" stroke-width="2.5"/>
    <path d="M74 128 L126 128 L133 160 L67 160 Z" fill="rgb(0 0 0 / 0.1)"/>
    <g fill="none" stroke="rgb(0 0 0 / 0.3)" stroke-width="1.2"><path d="M74 128 L67 152"/><path d="M126 128 L133 152"/></g>
    <path d="M75 130 L126 130" fill="none" stroke="rgb(255 255 255 / 0.2)" stroke-width="0.6" stroke-dasharray="2 2"/>
    <g fill="none" stroke="rgb(0 0 0 / 0.14)" stroke-width="2" stroke-linecap="round">
      <path d="M66 108 Q72 130 66 160"/><path d="M134 108 Q128 130 134 160"/>
      <path d="M156 110 Q152 124 158 140"/><path d="M44 110 Q48 124 42 140"/>
    </g>
    <g stroke="${DRAWCORD}" stroke-width="1.8" stroke-linecap="round" fill="none">
      <path d="M94 54 Q93 70 91 86"/><path d="M106 54 Q107 70 109 84"/>
    </g>
    <g fill="#9a968e"><rect x="89.6" y="85" width="3" height="6" rx="1"/><rect x="107.6" y="83" width="3" height="6" rx="1"/></g>`;
}

function capDetails() {
  return `
    <g fill="none" stroke="rgb(0 0 0 / 0.28)" stroke-width="0.9">
      <path d="M100 57 L100 119"/><path d="M72 63 Q62 90 60 120"/><path d="M128 63 Q138 90 140 120"/>
    </g>
    <g fill="rgb(0 0 0 / 0.5)"><circle cx="74" cy="80" r="1.6"/><circle cx="126" cy="80" r="1.6"/></g>
    <path d="M38 118 Q100 134 162 118 Q100 124 38 118 Z" fill="rgb(0 0 0 / 0.35)"/>
    <g fill="none" stroke="rgb(255 255 255 / 0.22)" stroke-width="0.6" stroke-dasharray="2 2">
      <path d="M44 126 Q100 142 156 126"/><path d="M50 133 Q100 148 150 133"/>
    </g>`;
}

const PIECES = {
  tee: { body: TEE_BODY, details: teeDetails, print: { x: 81, y: 52, w: 38 }, shadowY: 184 },
  hoodie: {
    body: HOODIE_BODY, details: hoodieDetails, print: { x: 82, y: 94, w: 36 }, shadowY: 186,
    hood: 'M70 52 Q64 16 100 12 Q136 16 130 52 Z',
  },
  cap: { body: CAP_CROWN, details: capDetails, print: { x: 81, y: 80, w: 38 }, shadowY: 158, brim: CAP_BRIM, button: true },
};

function gradients(id) {
  return `
    <defs>
      <linearGradient id="${id}-h" x1="0" x2="1">
        <stop offset="0" stop-color="#000" stop-opacity="0.38"/>
        <stop offset="0.2" stop-color="#000" stop-opacity="0.04"/>
        <stop offset="0.45" stop-color="#fff" stop-opacity="0.08"/>
        <stop offset="0.8" stop-color="#000" stop-opacity="0.06"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.4"/>
      </linearGradient>
      <linearGradient id="${id}-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.06"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.22"/>
      </linearGradient>
      <radialGradient id="${id}-s">
        <stop offset="0" stop-color="#000" stop-opacity="0.6"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
}

/* ---------- Mockup SVG ---------- */
export function garmentSvg(product, label = '') {
  const piece = PIECES[product.kind] ?? PIECES.tee;
  const id = `g${(svgCounter += 1)}`;
  const color = escapeAttr(product.color);
  const aria = label ? `role="img" aria-label="${escapeAttr(label)}"` : 'aria-hidden="true"';
  const { x, y, w } = piece.print;
  const shapes = [piece.hood, piece.body, piece.brim].filter(Boolean);
  const shading = shapes.map((d) => `<path d="${d}" fill="url(#${id}-h)"/><path d="${d}" fill="url(#${id}-v)"/>`).join('');
  const outlines = shapes.map((d) => `<path d="${d}" fill="none" stroke="rgb(0 0 0 / 0.45)" stroke-width="0.8" stroke-linejoin="round"/>`).join('');

  return `
    <svg viewBox="0 0 200 200" ${aria} class="garment">
      ${gradients(id)}
      <ellipse cx="100" cy="${piece.shadowY}" rx="64" ry="6" fill="url(#${id}-s)"/>
      ${piece.hood ? `<path d="${piece.hood}" fill="${color}"/><path d="${piece.hood}" fill="rgb(0 0 0 / 0.25)"/>` : ''}
      <path d="${piece.body}" fill="${color}"/>
      ${piece.brim ? `<path d="${piece.brim}" fill="${color}"/>` : ''}
      ${shading}
      ${piece.details()}
      <image href="img/logo-${escapeAttr(product.logo)}.png" x="${x}" y="${y}" width="${w}"
        height="${(w * LOGO_RATIO).toFixed(1)}" preserveAspectRatio="xMidYMid meet" opacity="0.94"/>
      ${piece.button ? `<circle cx="100" cy="56" r="4.5" fill="${color}"/><circle cx="100" cy="56" r="4.5" fill="rgb(0 0 0 / 0.25)"/>` : ''}
      ${outlines}
    </svg>`;
}

/**
 * Visuel d'un produit : photo PNG détourée si `product.image` est renseigné, sinon mockup SVG.
 * @param {object} product
 * @param {string} [label] texte alternatif ; vide = image décorative
 * @returns {string}
 */
export function productVisual(product, label = '') {
  if (!product.image) return garmentSvg(product, label);
  return `<img class="garment garment-photo" src="${escapeAttr(product.image)}" alt="${escapeAttr(label)}"
    width="800" height="800" loading="lazy" decoding="async">`;
}
