'use strict';

/* ============================================================
   ALPHABET CONSTANTS
   ============================================================ */
const OUTER_ALPHABET = 'ABCDEFGHIKLMNOPQRSTVXYZ'.split('');  // classical 23-letter
const INNER_ALPHABET = 'ABCDEFGHIKLMNOPQRSTVXYZ'.split('');  // same, rotatable
const FULL_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';             // modern 26-letter for cipher

/* ============================================================
   DOM REFS
   ============================================================ */
const plaintextEl   = document.getElementById('plaintext');
const ciphertextEl  = document.getElementById('ciphertext');
const keySlider     = document.getElementById('key-slider');
const keyValueEl    = document.getElementById('key-value');
const sliderFill    = document.getElementById('slider-fill');
const plainCount    = document.getElementById('plain-count');
const cipherCount   = document.getElementById('cipher-count');
const modeBadge     = document.getElementById('mode-badge');
const btnEncrypt    = document.getElementById('btn-encrypt');
const btnDecrypt    = document.getElementById('btn-decrypt');
const copyBtn       = document.getElementById('copy-btn');
const wheelInner    = document.getElementById('wheel-inner');
const canvasOuter   = document.getElementById('canvas-outer');
const canvasInner   = document.getElementById('canvas-inner');

/* ============================================================
   APP STATE
   ============================================================ */
let currentKey  = 3;
let isEncrypt   = true;
let wheelAngle  = 0;  // current rendered angle in degrees

/* ============================================================
   CANVAS DRAWING — OUTER RING (fixed)
   ============================================================ */
function drawOuterRing(activeLetter = null) {
  const size = canvasOuter.parentElement.offsetWidth;
  canvasOuter.width  = size;
  canvasOuter.height = size;

  const ctx    = canvasOuter.getContext('2d');
  const cx     = size / 2;
  const cy     = size / 2;
  const rOuter = size / 2 - 2;

  ctx.clearRect(0, 0, size, size);

  /* --- outer decorative rings --- */
  [rOuter - 4, rOuter - 18, rOuter - 32].forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = i === 1
      ? 'rgba(255,182,0,0.35)'
      : 'rgba(255,182,0,0.12)';
    ctx.lineWidth = i === 1 ? 1.5 : 0.8;
    ctx.stroke();
  });

  /* --- tick marks around the outer ring --- */
  const nTicks = 72;
  for (let i = 0; i < nTicks; i++) {
    const angle = (i / nTicks) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 3 === 0;
    const r1 = rOuter - 4;
    const r2 = isMajor ? rOuter - 20 : rOuter - 14;

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.strokeStyle = isMajor ? 'rgba(255,182,0,0.5)' : 'rgba(255,182,0,0.18)';
    ctx.lineWidth   = isMajor ? 1.2 : 0.6;
    ctx.stroke();
  }

  /* --- outer alphabet letters --- */
  const letters = OUTER_ALPHABET;
  const n       = letters.length;
  const textR   = rOuter - 42;

  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < n; i++) {
    const angle         = (i / n) * Math.PI * 2 - Math.PI / 2;
    const lx            = cx + Math.cos(angle) * textR;
    const ly            = cy + Math.sin(angle) * textR;
    const isHighlighted = activeLetter && letters[i] === activeLetter;

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle + Math.PI / 2);

    if (isHighlighted) {
      ctx.font        = `bold ${Math.round(size * 0.046)}px Cinzel, Georgia, serif`;
      ctx.shadowColor = 'rgba(255, 220, 120, 0.6)';
      ctx.shadowBlur  = 10;
      ctx.fillStyle   = 'rgba(255, 245, 200, 0.95)';
    } else {
      ctx.font        = `bold ${Math.round(size * 0.042)}px Cinzel, Georgia, serif`;
      ctx.shadowColor = 'rgba(255,182,0,0.4)';
      ctx.shadowBlur  = 6;
      ctx.fillStyle   = 'rgba(255, 220, 120, 0.92)';
    }

    ctx.fillText(letters[i], 0, 0);
    ctx.restore();
  }

  ctx.restore();

  /* --- inner boundary ring (where inner wheel sits) --- */
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.365, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(180,130,20,0.5)';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  /* --- decorative dots between letters --- */
  for (let i = 0; i < n; i++) {
    const angle = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
    const dr    = rOuter - 48;
    const dx    = cx + Math.cos(angle) * dr;
    const dy    = cy + Math.sin(angle) * dr;

    ctx.beginPath();
    ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,182,0,0.25)';
    ctx.fill();
  }
}

/* ============================================================
   CANVAS DRAWING — INNER RING
   ============================================================ */
function drawInnerRing() {
  const size = canvasInner.parentElement.offsetWidth;
  canvasInner.width  = size;
  canvasInner.height = size;

  const ctx  = canvasInner.getContext('2d');
  const cx   = size / 2;
  const cy   = size / 2;
  const rOut = size / 2 - 2;

  ctx.clearRect(0, 0, size, size);

  /* --- concentric decorative rings on inner wheel --- */
  [rOut - 4, rOut - 16, rOut - 28].forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = i === 1
      ? 'rgba(200,160,40,0.45)'
      : 'rgba(200,160,40,0.15)';
    ctx.lineWidth = i === 1 ? 1.2 : 0.7;
    ctx.stroke();
  });

  /* --- inner tick marks --- */
  const nTicks = 46;
  for (let i = 0; i < nTicks; i++) {
    const angle   = (i / nTicks) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 2 === 0;
    const r1 = rOut - 4;
    const r2 = isMajor ? rOut - 16 : rOut - 10;

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.strokeStyle = isMajor ? 'rgba(200,160,40,0.45)' : 'rgba(200,160,40,0.18)';
    ctx.lineWidth   = isMajor ? 1 : 0.5;
    ctx.stroke();
  }

  /* --- inner alphabet letters --- */
  const letters = INNER_ALPHABET;
  const n       = letters.length;
  const textR   = rOut - 36;

  ctx.save();
  ctx.font         = `bold ${Math.round(size * 0.055)}px Cinzel, Georgia, serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const lx    = cx + Math.cos(angle) * textR;
    const ly    = cy + Math.sin(angle) * textR;

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle + Math.PI / 2);

    ctx.shadowColor = 'rgba(255,210,60,0.5)';
    ctx.shadowBlur  = 8;
    ctx.fillStyle   = 'rgba(255, 230, 140, 0.95)';
    ctx.fillText(letters[i], 0, 0);
    ctx.restore();
  }

  ctx.restore();

  /* --- second inner ring decoration --- */
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(180,130,20,0.35)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  /* --- radiating lines from center --- */
  const spokes = 12;
  const r1 = size * 0.13;
  const r2 = size * 0.28;
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.strokeStyle = 'rgba(200,160,40,0.12)';
    ctx.lineWidth   = 0.7;
    ctx.stroke();
  }
}

/* ============================================================
   WHEEL ROTATION
   ============================================================ */
function rotateWheel(key) {
  const degreesPerStep = 360 / OUTER_ALPHABET.length;
  wheelAngle = key * degreesPerStep;
  wheelInner.style.transform = `translate(-50%, -50%) rotate(${wheelAngle}deg)`;
}

/* ============================================================
   CAESAR CIPHER LOGIC — with full input validation
   ============================================================ */
function caesarCipher(text, shift, encrypt) {
  if (typeof text !== 'string' || text.length === 0) return '';

  // Clamp shift to a valid 0-25 range regardless of input
  shift = ((shift % 26) + 26) % 26;
  if (!encrypt) shift = (26 - shift) % 26;

  try {
    // [...text] uses the JS string iterator: correctly handles emoji,
    // surrogate pairs and any multi-byte Unicode character as a single unit.
    return [...text]
      .map(char => {
        const cp = char.codePointAt(0);

        // Uppercase A-Z (65-90)
        if (cp >= 65 && cp <= 90) {
          return FULL_ALPHA[(cp - 65 + shift) % 26];
        }
        // Lowercase a-z (97-122)
        if (cp >= 97 && cp <= 122) {
          return FULL_ALPHA[(cp - 97 + shift) % 26].toLowerCase();
        }
        // Everything else — spaces, digits, punctuation, emoji,
        // Cyrillic, Arabic, CJK, etc. — passes through untouched.
        return char;
      })
      .join('');
  } catch {
    // Last-resort safety net: return the original text unmodified.
    return text;
  }
}

/* ============================================================
   UPDATE — runs on any input or slider change
   ============================================================ */
function update() {
  const rawText  = plaintextEl.value;
  const output   = caesarCipher(rawText, currentKey, isEncrypt);

  ciphertextEl.value = output;

  // Use spread to count actual Unicode characters, not UTF-16 code units
  // (an emoji like 😀 has .length === 2 but is 1 character)
  const plainChars  = [...rawText].length;
  const cipherChars = [...output].length;
  plainCount.textContent  = `${plainChars} character${plainChars === 1 ? '' : 's'}`;
  cipherCount.textContent = `${cipherChars} character${cipherChars === 1 ? '' : 's'}`;
}

/* ============================================================
   SLIDER UPDATE
   ============================================================ */
function updateSlider() {
  currentKey = parseInt(keySlider.value, 10);
  if (!Number.isFinite(currentKey) || currentKey < 1 || currentKey > 25) currentKey = 1;

  const direction = isEncrypt ? '+' : '−';
  keyValueEl.textContent = `${direction}${currentKey}`;

  // bump animation
  keyValueEl.classList.remove('bump');
  void keyValueEl.offsetWidth;  // reflow to restart animation
  keyValueEl.classList.add('bump');

  // fill track
  const pct = ((currentKey - 1) / 24) * 100;
  sliderFill.style.width = `${pct}%`;

  rotateWheel(currentKey);
  update();
}

/* ============================================================
   MODE TOGGLE
   ============================================================ */
function setMode(encrypt) {
  isEncrypt = encrypt;

  btnEncrypt.classList.toggle('active', encrypt);
  btnDecrypt.classList.toggle('active', !encrypt);

  const bruteBtnWrap = document.querySelector('.brute-btn-wrap');
  if (encrypt) {
    bruteBtnWrap.classList.remove('visible');
    closeBruteForce();
  } else {
    bruteBtnWrap.classList.add('visible');
  }

  modeBadge.textContent = encrypt ? 'ENCRYPTION' : 'DECRYPTION';
  modeBadge.style.color = encrypt
    ? 'var(--accent)'
    : 'var(--blue)';
  modeBadge.style.borderColor = encrypt
    ? 'var(--border)'
    : 'rgba(58,175,255,0.3)';

  const direction = encrypt ? '+' : '−';
  keyValueEl.textContent = `${direction}${currentKey}`;

  update();
}

/* ============================================================
   COPY BUTTON
   ============================================================ */
function copyOutput() {
  const text = ciphertextEl.value;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      COPIED`;
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        COPY`;
    }, 1800);
  });
}

/* ============================================================
   BRUTE FORCE
   ============================================================ */
const bruteSectionEl = document.getElementById('brute-section');
const bruteResultsEl = document.getElementById('brute-results');
const bruteBtnEl     = document.getElementById('brute-btn');
const bruteCloseEl   = document.getElementById('brute-close');

function runBruteForce() {
  const input = plaintextEl.value;
  if (!input.trim()) return;

  bruteResultsEl.innerHTML = '';

  for (let key = 1; key <= 25; key++) {
    const decrypted = caesarCipher(input, key, false);

    const row = document.createElement('div');
    row.className = 'brute-row';
    row.dataset.key = key;

    const keyBadge = document.createElement('span');
    keyBadge.className = 'brute-key';
    keyBadge.textContent = `KEY −${key}`;

    const textSpan = document.createElement('span');
    textSpan.className = 'brute-text';
    textSpan.textContent = decrypted;

    row.appendChild(keyBadge);
    row.appendChild(textSpan);
    row.addEventListener('click', () => applyBruteForceKey(key));

    bruteResultsEl.appendChild(row);
  }

  bruteSectionEl.removeAttribute('hidden');
  bruteSectionEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function applyBruteForceKey(key) {
  keySlider.value = key;
  setMode(false);
  updateSlider();

  document.querySelectorAll('.brute-row').forEach(r => r.classList.remove('brute-row-active'));
  const activeRow = bruteResultsEl.querySelector(`.brute-row[data-key="${key}"]`);
  if (activeRow) activeRow.classList.add('brute-row-active');
}

function closeBruteForce() {
  bruteSectionEl.setAttribute('hidden', '');
  bruteResultsEl.innerHTML = '';
}

/* ============================================================
   LETTER HIGHLIGHT
   ============================================================ */
let highlightTimer = null;

function triggerLetterHighlight(letter) {
  clearTimeout(highlightTimer);
  drawOuterRing(letter);
  highlightTimer = setTimeout(() => drawOuterRing(null), 650);
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
bruteBtnEl.addEventListener('click', runBruteForce);
bruteCloseEl.addEventListener('click', closeBruteForce);

plaintextEl.addEventListener('input', e => {
  update();
  const ch = e.data;
  if (ch && /[A-Za-z]/.test(ch)) triggerLetterHighlight(ch.toUpperCase());
});
keySlider.addEventListener('input', updateSlider);
btnEncrypt.addEventListener('click', () => setMode(true));
btnDecrypt.addEventListener('click', () => setMode(false));
copyBtn.addEventListener('click', copyOutput);

/* ============================================================
   RESIZE — REDRAW CANVASES
   ============================================================ */
function onResize() {
  drawOuterRing();
  drawInnerRing();
}

window.addEventListener('resize', onResize);

/* ============================================================
   INIT
   ============================================================ */
function init() {
  // wait for fonts to load for accurate canvas text rendering
  document.fonts.ready.then(() => {
    drawOuterRing();
    drawInnerRing();
    updateSlider();
  });
}

init();
