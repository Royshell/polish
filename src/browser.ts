export const isFirefox: boolean = typeof (globalThis as any).browser?.sidebarAction !== 'undefined';

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
