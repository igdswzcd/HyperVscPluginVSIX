import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
import { Disposable } from './dispose';

const localize = nls.loadMessageBundle();
export interface ShowOptions {
  readonly preserveFocus?: boolean;
  readonly viewColumn?: vscode.ViewColumn;
}

export class HyprCsebView extends Disposable {
  public static readonly viewType = 'hyprCseb.view';
  private static readonly title = localize('view.title', 'Hyper Cseb');

  private readonly _webviewPanel: vscode.WebviewPanel;

  private readonly _onDidDispose = this._register(
    new vscode.EventEmitter<void>()
  );
  public readonly onDispose = this._onDidDispose.event;

  public static create(
    extensionUri: vscode.Uri,
    url: string,
    showOptions?: ShowOptions
  ): HyprCsebView {
    const webview = vscode.window.createWebviewPanel(
      HyprCsebView.viewType,
      HyprCsebView.title,
      {
        viewColumn: showOptions?.viewColumn ?? vscode.ViewColumn.Active,
        preserveFocus: showOptions?.preserveFocus,
      },
      {
        enableScripts: true,
        enableForms: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      }
    );
    return new HyprCsebView(extensionUri, url, webview);
  }

  public static restore(
    extensionUri: vscode.Uri,
    url: string,
    webview: vscode.WebviewPanel
  ): HyprCsebView {
    return new HyprCsebView(extensionUri, url, webview);
  }

  private constructor(
    private readonly extensionUri: vscode.Uri,
    url: string,
    webviewPanel: vscode.WebviewPanel
  ) {
    super();

    this._webviewPanel = this._register(webviewPanel);

    this._register(
      this._webviewPanel.webview.onDidReceiveMessage((e) => {
        switch (e.type) {
          case 'openExternal':
            try {
              const url = vscode.Uri.parse(e.url);
              vscode.env.openExternal(url);
            } catch {
              // Noop
            }
            break;
        }
      })
    );

    this._register(
      this._webviewPanel.onDidDispose(() => {
        this.dispose();
      })
    );

    // this._register(
    //   vscode.workspace.onDidChangeConfiguration((e) => {
    //     if (e.affectsConfiguration('hyprCseb.focusLockIndicator.enabled')) {
    //       const configuration = vscode.workspace.getConfiguration('hyprCseb');
    //       this._webviewPanel.webview.postMessage({
    //         type: 'didChangeFocusLockIndicatorEnabled',
    //         focusLockEnabled: configuration.get<boolean>(
    //           'focusLockIndicator.enabled',
    //           true
    //         ),
    //       });
    //     }
    //   })
    // );

    this.show(url);
  }

  public override dispose() {
    this._onDidDispose.fire();
    super.dispose();
  }

  public show(url: string, options?: ShowOptions) {
    this._webviewPanel.webview.html = this.getHtml(url);
    this._webviewPanel.reveal(options?.viewColumn, options?.preserveFocus);
  }

  private getHtml(url: string) {
    // const configuration = vscode.workspace.getConfiguration('hyprCseb');
    const configuration = vscode.workspace.getConfiguration('hyprCseb');

    const nonce = getNonce();

    const mainJs = this.extensionResourceUrl('media', 'index.js');
    const mainCss = this.extensionResourceUrl('media', 'main.css');
    const codiconsUri = this.extensionResourceUrl('media', 'codicon.css');

    return /* html */ `<!DOCTYPE html>
			<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">

				<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					font-src ${this._webviewPanel.webview.cspSource};
					style-src ${this._webviewPanel.webview.cspSource};
					script-src 'nonce-${nonce}';
					frame-src *;
					">
          <meta id="simple-browser-settings" data-settings="${escapeAttribute(
            JSON.stringify({
              url: url,
              focusLockEnabled: configuration.get<boolean>(
                'focusLockIndicator.enabled',
                true
              ),
            })
          )}">
              <link rel="stylesheet" type="text/css" href="${mainCss}">
              <link rel="stylesheet" type="text/css" href="${codiconsUri}">
            </head>
			<body>
				<header class="header">
				</header>
				<div class="content">
					<iframe sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
				</div>

				<script src="${mainJs}" nonce="${nonce}"></script>
			</body>
			</html>`;
  }

  private extensionResourceUrl(...parts: string[]): vscode.Uri {
    return this._webviewPanel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, ...parts)
    );
  }
}

function escapeAttribute(value: string | vscode.Uri): string {
  return value.toString().replace(/"/g, '&quot;');
}
function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 64; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
