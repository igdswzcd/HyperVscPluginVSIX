/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { onceDocumentLoaded } from './events';

const vscode = acquireVsCodeApi();

function getSettings() {
  const element = document.getElementById('simple-browser-settings');
  if (element) {
    const data = element.getAttribute('data-settings');
    if (data) {
      return JSON.parse(data);
    }
  }

  throw new Error(`Could not load settings`);
}

const settings = getSettings();

const iframe = document.querySelector('iframe')!;
window.addEventListener('message', (e) => {
  switch (e.data.type) {
    case 'focus': {
      iframe.focus();
      break;
    }
    case 'didChangeFocusLockIndicatorEnabled': {
      toggleFocusLockIndicatorEnabled(e.data.enabled);
      break;
    }
  }
});

onceDocumentLoaded(() => {
  setInterval(() => {
    const iframeFocused = document.activeElement?.tagName === 'IFRAME';
    document.body.classList.toggle('iframe-focused', iframeFocused);
  }, 50);

  iframe.addEventListener('load', () => {
    // Noop
  });

  navigateTo(settings.url);
  toggleFocusLockIndicatorEnabled(settings.focusLockIndicatorEnabled);

  function navigateTo(rawUrl: string): void {
    try {
      const url = new URL(rawUrl);

      // Try to bust the cache for the iframe
      // There does not appear to be any way to reliably do this except modifying the url
      url.searchParams.append('vscodeBrowserReqId', Date.now().toString());

      iframe.src = url.toString();
    } catch {
      iframe.src = rawUrl;
    }

    vscode.setState({ url: rawUrl });
  }
});

function toggleFocusLockIndicatorEnabled(enabled: boolean) {
  document.body.classList.toggle('enable-focus-lock-indicator', enabled);
}
