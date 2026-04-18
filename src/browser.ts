interface FirefoxBrowser {
  // add this at  the top of the page
  sidebarAction?: unknown;
}

const browserAPI = (globalThis as { browser?: FirefoxBrowser }).browser;
export const isFirefox = typeof browserAPI?.sidebarAction !== 'undefined';

export async function openSidebar(tabId?: number): Promise<void> {
  if (isFirefox) {
    await (globalThis as any).browser.sidebarAction.open();
  } else {
    if (tabId === undefined) {
      console.error('[Polish] openSidebar: tabId is undefined');
      throw new Error('[Polish] openSidebar requires a tabId in Chrome');
    }
    await chrome.sidePanel.open({ tabId });
  }
}
