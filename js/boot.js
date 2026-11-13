// Séquence de démarrage façon terminal : une fois par session, passable au clic.
// Ignorée si l'utilisateur a demandé moins d'animations.

const BOOT_KEY = 'as-booted';
const LINE_DELAY_MS = 120;
const END_PAUSE_MS = 380;
const FADE_MS = 420;

const LINES = Object.freeze([
  '> initialisation du noyau gsd v1.0 ........ [ OK ]',
  '> montage de /drop_01 ...................... [ OK ]',
  '> chiffrement de la connexion .............. [ OK ]',
  '> filtrage du bruit ........................ [ OK ]',
  '> vérification authenticité : 100% ......... [ OK ]',
  '> accès autorisé. bienvenue.',
]);

function alreadyBooted() {
  try {
    return sessionStorage.getItem(BOOT_KEY) === '1';
  } catch {
    return false;
  }
}

function markBooted() {
  try {
    sessionStorage.setItem(BOOT_KEY, '1');
  } catch {
    // stockage indisponible (navigation privée stricte) : la séquence rejouera, sans gravité
  }
}

export function runBoot() {
  const overlay = document.querySelector('[data-boot]');
  const log = document.querySelector('[data-boot-log]');
  if (!overlay || !log) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || alreadyBooted()) {
    overlay.remove();
    return;
  }

  markBooted();
  overlay.hidden = false;
  const timers = [];

  const finish = () => {
    timers.forEach(clearTimeout);
    overlay.classList.add('is-done');
    setTimeout(() => overlay.remove(), FADE_MS);
    document.removeEventListener('keydown', finish);
  };

  LINES.forEach((line, index) => {
    timers.push(setTimeout(() => { log.textContent += `${line}\n`; }, index * LINE_DELAY_MS));
  });
  timers.push(setTimeout(finish, LINES.length * LINE_DELAY_MS + END_PAUSE_MS));

  overlay.addEventListener('click', finish, { once: true });
  document.addEventListener('keydown', finish, { once: true });
}
