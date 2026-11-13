// Page d'entrée avec code d'accès.
// Mise en scène de drop privé : le code est vérifié dans le navigateur via son empreinte SHA-256.
// Ce n'est pas une vraie protection (le site reste techniquement accessible), juste un filtre d'entrée.
import { ACCESS_CODE_SHA256 } from './config.js?v=14';

const STORAGE_KEY = 'as-access';
const FADE_MS = 450;
const SHAKE_MS = 400;

const normalize = (value) => value.trim().replace(/\s+/g, '').toUpperCase();

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readStoredAccess() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeAccess() {
  try {
    localStorage.setItem(STORAGE_KEY, ACCESS_CODE_SHA256);
  } catch {
    // stockage indisponible : le code sera redemandé à la prochaine visite
  }
}

function setPageInert(isInert) {
  document.querySelectorAll('body > :not([data-gate])').forEach((el) => { el.inert = isInert; });
  document.body.classList.toggle('is-locked', isInert);
}

// Compteur façon magnétoscope : 0:00:00 qui défile pendant que l'écran est affiché.
function startCounter(gate) {
  const el = gate.querySelector('[data-vhs-time]');
  if (!el) return () => {};
  const startedAt = Date.now();
  const tick = () => {
    const total = Math.floor((Date.now() - startedAt) / 1000);
    const h = Math.floor(total / 3600);
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const sec = String(total % 60).padStart(2, '0');
    el.textContent = `${h}:${m}:${sec}`;
  };
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}

function unlock(gate) {
  setPageInert(false);
  gate.classList.add('is-open');
  setTimeout(() => gate.remove(), FADE_MS);
}

export function initGate() {
  const gate = document.querySelector('[data-gate]');
  if (!gate) return;

  const isDisabled = !ACCESS_CODE_SHA256;
  const hasAccess = readStoredAccess() === ACCESS_CODE_SHA256;
  if (isDisabled || hasAccess || !window.crypto?.subtle) {
    setPageInert(false);
    gate.remove();
    return;
  }

  setPageInert(true);
  const stopCounter = startCounter(gate);
  const form = gate.querySelector('[data-gate-form]');
  const input = gate.querySelector('[data-gate-input]');
  const msg = gate.querySelector('[data-gate-msg]');
  input.focus();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = normalize(input.value);
    if (!code) {
      msg.textContent = 'Enter a code.';
      return;
    }
    const isValid = (await sha256Hex(code)) === ACCESS_CODE_SHA256;
    if (isValid) {
      msg.textContent = 'Access granted.';
      msg.classList.add('is-ok');
      storeAccess();
      stopCounter();
      unlock(gate);
      return;
    }
    msg.textContent = 'Access denied.';
    form.classList.add('is-wrong');
    setTimeout(() => form.classList.remove('is-wrong'), SHAKE_MS);
    input.select();
  });
}
