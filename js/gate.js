// Écran de verrouillage : logo, inscription e-mail, et accès par mot de passe.
// Le mot de passe est vérifié dans le navigateur via son empreinte SHA-256 :
// c'est un filtre d'entrée (drop privé), pas une vraie protection.
import { ACCESS_CODE_SHA256 } from './config.js?v=22';

const STORAGE_KEY = 'as-access';
const FADE_MS = 400;
const SHAKE_MS = 320;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    // stockage indisponible : le mot de passe sera redemandé à la prochaine visite
  }
}

function setPageInert(isInert) {
  document.querySelectorAll('body > :not([data-gate])').forEach((el) => { el.inert = isInert; });
  document.body.classList.toggle('is-locked', isInert);
}

function unlock(gate) {
  setPageInert(false);
  gate.classList.add('is-open');
  setTimeout(() => gate.remove(), FADE_MS);
}

function shake(form) {
  form.classList.add('is-wrong');
  setTimeout(() => form.classList.remove('is-wrong'), SHAKE_MS);
}

function bindEmail(gate) {
  const form = gate.querySelector('[data-gate-email]');
  const input = form.querySelector('input');
  const msg = gate.querySelector('[data-gate-email-msg]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = EMAIL_RE.test(input.value.trim());
    msg.classList.toggle('is-ok', isValid);
    if (!isValid) {
      msg.textContent = 'Enter a valid email.';
      shake(form);
      return;
    }
    // À brancher sur l'outil d'e-mailing (Shopify Email, Klaviyo…) : rien n'est encore envoyé.
    msg.textContent = 'You’re on the list.';
    form.reset();
  });
}

function bindPasswordToggle(gate) {
  const toggle = gate.querySelector('[data-gate-toggle]');
  const form = gate.querySelector('[data-gate-form]');
  toggle.addEventListener('click', () => {
    const isOpen = form.hidden;
    form.hidden = !isOpen;
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) form.querySelector('input').focus();
  });
}

function bindPassword(gate) {
  const form = gate.querySelector('[data-gate-form]');
  const input = gate.querySelector('[data-gate-input]');
  const msg = gate.querySelector('[data-gate-msg]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = normalize(input.value);
    if (!code) {
      msg.textContent = 'Enter the password.';
      return;
    }
    if ((await sha256Hex(code)) === ACCESS_CODE_SHA256) {
      msg.textContent = '';
      storeAccess();
      unlock(gate);
      return;
    }
    msg.textContent = 'Wrong password.';
    shake(form);
    input.select();
  });
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
  bindEmail(gate);
  bindPasswordToggle(gate);
  bindPassword(gate);
}
