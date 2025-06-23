// content-script.js (Runs on every matching page)

(() => {
  // More advanced ad element detection using heuristics
  const suspiciousKeywords = [
    'sponsored',
    'promotion',
    'advert',
    'banner',
    'pop-up',
    'ad-',
    'ad_'
  ];

  function removeByHeuristic() {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const id = el.id?.toLowerCase() || '';
      const classes = el.className?.toLowerCase() || '';
      const content = (el.textContent || '').toLowerCase();

      if (suspiciousKeywords.some(keyword => id.includes(keyword) ||
                                             classes.includes(keyword) ||
                                             content.includes(keyword))) {
        el.remove();
      }
    });
  }

  // Initial removal
  removeByHeuristic();

  // Observe DOM changes for newly inserted ad elements
  const observer = new MutationObserver(mutations => {
    mutations.forEach(() => removeByHeuristic());
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();