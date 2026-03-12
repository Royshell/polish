const STYLE_ID = 'polish-injected';

chrome.runtime.onMessage.addListener((message: { type: string; css: string }) => {
  if (message.type !== 'APPLY_CSS') {
    return;
  }

  if (!message.css || message.css.trim() === '') {
    document.getElementById(STYLE_ID)?.remove();
    return;
  }

  // Find existing tag or create new one
  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  console.log('injecting css!');

  styleEl.textContent = message.css;
});
