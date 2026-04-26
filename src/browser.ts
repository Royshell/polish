interface FirefoxBrowser {
  sidebarAction?: {
    open: () => Promise<void>;
  };
}

interface ChromiumSidePanel {
  open: (options: { tabId: number }) => Promise<void>;
}

interface ChromiumAPI {
  sidePanel: ChromiumSidePanel;
}

const browserAPI = (globalThis as { browser?: FirefoxBrowser }).browser;

export const isFirefox = typeof browserAPI?.sidebarAction !== 'undefined';

function getChromiumAPI(): ChromiumAPI {
  const chromium = globalThis.chrome as unknown as ChromiumAPI;

  if (!chromium?.sidePanel) {
    throw new Error('Chromium sidePanel API not available');
  }

  return chromium;
}

export async function openSidebar(tabId?: number): Promise<void> {
  if (isFirefox) {
    await browserAPI!.sidebarAction!.open();
  } else {
    if (tabId === undefined) {
      throw new Error('[Polish] openSidebar requires a tabId in Chromium');
    }

    const chromium = getChromiumAPI();
    await chromium.sidePanel.open({ tabId });
  }
}
