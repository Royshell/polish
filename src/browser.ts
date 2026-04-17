interface FirefoxBrowser { // add this at  the top of the page
  sidebarAction?: unknown;
}

const browserAPI = (globalThis as { browser?: FirefoxBrowser }).browser;
export const isFirefox = typeof browserAPI?.sidebarAction !== 'undefined';

export async function openSidebar(tabId?: number): Promise<void> {
  if (isFirefox) {
    await (globalThis as any).browser.sidebarAction.open();
  } else {
    if (tabId !== undefined) {
      await chrome.sidePanel.open({ tabId });
    }
  }
}
