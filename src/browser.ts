export const isFirefox: boolean = typeof (globalThis as any).browser?.sidebarAction !== 'undefined';

export async function openSidebar(tabId?: number): Promise<void> {
  if (isFirefox) {
    await (globalThis as any).browser.sidebarAction.open();
  } else {
    if (tabId !== undefined) {
      await chrome.sidePanel.open({ tabId });
    }
  }
}
