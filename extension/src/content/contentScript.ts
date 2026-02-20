const ROOT_ID = 'polish-root';

console.log('Polish content script loaded ✅');

chrome.runtime.onMessage.addListener((message) => {
  console.log('listened 3');
  if (message.type === 'POLISH_TOGGLE_SIDEBAR') {
    const existingRoot = document.getElementById(ROOT_ID);

    if (existingRoot) {
      console.log('root removing');
      existingRoot.remove();
    } else {
      const script = document.createElement('script');
      script.type = 'module';

      document.head.appendChild(script);
    }
  }
});
