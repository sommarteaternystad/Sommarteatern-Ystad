/**
 * sponsors.js — dynamically loads sponsor logos from folder structure
 *
 * Folder structure:
 *   images/Sponsorer/Spotlight/   ← Huvudsponsorer (largest logos)
 *   images/Sponsorer/Musikal/
 *   images/Sponsorer/Komedi/
 *   images/Sponsorer/Revy/
 *   images/Sponsorer/Samarbete/   ← Samarbetspartners (normal size)
 *
 * Just drop logo images (jpg/png/svg/webp) into a folder — they
 * appear automatically on both sponsorer.html and index.html.
 */

(function () {
  const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'];

  const TIERS = [
    { id: 'spotlight', folder: 'images/Sponsorer/Spotlight' },
    { id: 'musikal',   folder: 'images/Sponsorer/Musikal' },
    { id: 'komedi',    folder: 'images/Sponsorer/Komedi' },
    { id: 'revy',      folder: 'images/Sponsorer/Revy' },
    { id: 'samarbete', folder: 'images/Sponsorer/Samarbete' },
  ];

  /** Fetch a folder's directory listing and return absolute image paths. */
  async function fetchImages(folder) {
    try {
      const res = await fetch(folder + '/');
      if (!res.ok) return [];
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return Array.from(doc.querySelectorAll('a[href]'))
        .map(a => a.getAttribute('href'))
        .filter(href => href && IMAGE_EXTS.some(ext => href.toLowerCase().endsWith(ext)))
        .map(href => folder + '/' + href.replace(/^.*\//, ''));
    } catch {
      return [];
    }
  }

  /** Populate a logos container on sponsorer.html */
  async function loadSponsorPage() {
    for (const tier of TIERS) {
      const container = document.getElementById('logos-' + tier.id);
      if (!container) continue;
      const imgs = await fetchImages(tier.folder);
      if (imgs.length === 0) continue;
      container.innerHTML = imgs.map(src =>
        `<div class="sponsor-logo-card"><img src="${src}" alt="Sponsor" loading="lazy"></div>`
      ).join('');
    }
  }

  /** Populate the infinite ticker on index.html */
  async function loadTicker() {
    const track = document.getElementById('sponsor-track-dynamic');
    if (!track) return;
    const allImgs = [];
    for (const tier of TIERS) {
      allImgs.push(...await fetchImages(tier.folder));
    }
    if (allImgs.length === 0) return;
    // Duplicate for seamless infinite loop
    track.innerHTML = [...allImgs, ...allImgs]
      .map(src => `<div class="sponsor-logo"><img src="${src}" alt="Samarbetspartner" loading="lazy"></div>`)
      .join('');
  }

  function init() {
    loadSponsorPage();
    loadTicker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
