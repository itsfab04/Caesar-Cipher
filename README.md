
<p align="center">
  <img src="assets/favicon.svg" alt="Caesar Cipher favicon" width="80" />
</p>

# Caesar Cipher — Interactive Cryptographic Wheel

> A modern, historically-inspired web app for the Caesar Cipher — featuring an animated cryptographic wheel, real-time encryption, multilingual brute-force analysis, and a Roman aesthetic that bridges ancient history with contemporary web design.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square)

---

## Live Demo

**[caesar-cipher-ebon.vercel.app](https://caesar-cipher-ebon.vercel.app)**

No installation required — open the link and start encrypting instantly.

---

## Overview

This project reimagines the classical Caesar Cipher as an immersive web experience. The visual design draws inspiration from [CTRL/Shift](https://www.ctrlshift.events), while placing a faithful animated reproduction of the historical cryptographic disc at the center of the interface.

The cryptographic wheel rotates in real time as the user adjusts the shift key, and every letter typed in the plaintext is momentarily highlighted on the outer ring, creating a tangible connection between the digital tool and the physical object it represents.

---

## Features

| Feature | Description |
|---|---|
| **Animated Cryptographic Wheel** | Two-ring SVG/Canvas disc that physically rotates when the shift key changes, rendered with wood-grain texture and vintage gold lettering |
| **Real-time Encryption & Decryption** | Text is processed character-by-character as you type, with no need to submit a form |
| **Multilingual Brute-Force Analysis** | Tries all 25 possible keys at once; only A–Z characters are shifted — spaces, numbers, punctuation, emoji, Cyrillic, Arabic and any other script pass through untouched, keeping every language's structure readable |
| **Letter Highlight on Outer Ring** | Each typed letter briefly illuminates its position on the outer ring, showing which letter is being encoded |
| **Per-letter Character Preservation** | Uppercase/lowercase distinction is fully maintained throughout encryption and decryption |
| **Roman Aesthetic** | Pompeian-red ambient background, gold-leaf laurel branch decorations, and Cinzel serif typography evoking Imperial Rome |
| **Copy to Clipboard** | One-click copy of the output text with visual confirmation |
| **Keyboard Shift Display** | A live numeric indicator shows the current offset with direction sign (+3, −7, etc.) |
| **Fully Responsive** | Adapts to tablets and mobile screens via CSS Grid breakpoints |

---

## Quick Start

No build step, no dependencies, no server required.

```bash
# Clone the repository
git clone https://github.com/itsfab04/caesar-cipher.git

# Open in browser
open caesar-cipher/index.html
```

Or simply **download the ZIP**, extract it, and double-click `index.html`.

The app requires an internet connection only to load two Google Fonts (`Space Mono` and `Cinzel`). All logic runs entirely client-side.

---

## Project Structure

```
caesar-cipher/
├── index.html          # App shell, layout, SVG decorations
├── css/
│   └── style.css       # All styles: layout, wheel, animations, brute-force panel
├── js/
│   └── script.js       # Cipher logic, canvas rendering, brute-force, event handlers
├── assets/
│   └── favicon.svg     # Scalable icon matching the cryptographic wheel design
├── README.md
├── LICENSE
└── .gitignore
```

---

## How the Caesar Cipher Works

The Caesar cipher is one of the oldest and simplest encryption techniques. It works by shifting each letter of the plaintext by a fixed number of positions in the alphabet.

```
Plaintext:   HELLO WORLD
Shift key:   +3
Ciphertext:  KHOOR ZRUOG
```

The shift "wraps around" at the end of the alphabet — shifting `Z` by 3 gives `C`.

**Decryption** is the reverse: apply a shift of `26 − key` in the same direction (or equivalently, shift by `key` in the opposite direction).

**Why brute force works:** Since there are only 25 possible non-trivial keys (1 through 25), an attacker can try every one of them and identify the correct plaintext by reading. This makes the Caesar cipher unsuitable for any real security purpose, but invaluable as a pedagogical tool for understanding substitution ciphers.

### Algorithm (JavaScript)

```js
function caesarCipher(text, shift, encrypt) {
  shift = ((shift % 26) + 26) % 26;
  if (!encrypt) shift = (26 - shift) % 26;

  return [...text].map(char => {
    const cp = char.codePointAt(0);
    if (cp >= 65 && cp <= 90) return ALPHABET[(cp - 65 + shift) % 26];         // A-Z
    if (cp >= 97 && cp <= 122) return ALPHABET[(cp - 97 + shift) % 26].toLowerCase(); // a-z
    return char; // everything else: unchanged
  }).join('');
}
```

The spread operator `[...text]` handles emoji and multi-byte Unicode characters correctly, avoiding the surrogate-pair bug present in `.split('')`.

---

## Tech Stack

- **HTML5** — semantic structure, inline SVG for laurel decorations and favicon
- **CSS3** — CSS Grid layout, `backdrop-filter`, `conic-gradient` for wood texture, `@keyframes` animations, custom range input styling
- **Vanilla JavaScript (ES2020)** — Canvas 2D API for wheel rendering, `codePointAt` for Unicode-safe cipher, `navigator.clipboard` for copy
- **Google Fonts** — [Cinzel](https://fonts.google.com/specimen/Cinzel) (historical serif) + [Space Mono](https://fonts.google.com/specimen/Space+Mono) (technical monospace)

---

## Design References

The floating-panel layout is inspired by the visual language of [CTRL/Shift 2026](https://www.ctrlshift.events), adapted with a Roman-Imperial colour palette:

| Token | Value | Usage |
|---|---|---|
| Background | `#0b0c11` | Deep space black |
| Accent | `#ffb600` | Gold — borders, glows, key display |
| Roman Red | `#941216` | Ambient side panels, brute-force UI |
| Text | `#d4c9a8` | Warm parchment white |

---

## Browser Support

| Browser | Status |
|---|---|
| Chrome / Edge 88+ | Full support |
| Firefox 90+ | Full support |
| Safari 15.4+ | Full support (`backdrop-filter` requires prefix on older versions) |
| Mobile (iOS / Android) | Responsive layout, touch-friendly slider |

---

## License

[MIT](https://opensource.org/licenses/MIT) — free to use, modify, and distribute.

---

*Built by [Fabrizio Centrella](https://linktr.ee/itsfab_)*

