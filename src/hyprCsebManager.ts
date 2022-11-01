import * as vscode from 'vscode';

import { ShowOptions, HyprCsebView } from './hyprCsebView';

export class HyprCsebManager {
  private _activeView?: HyprCsebView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  dispose() {
    this._activeView?.dispose();
    this._activeView = undefined;
  }

  public show(inputUri: string | vscode.Uri, options?: ShowOptions): void {
    const url =
      typeof inputUri === 'string' ? inputUri : inputUri.toString(true);
    if (this._activeView) {
      this._activeView.show(url, options);
    } else {
      const view = HyprCsebView.create(this.extensionUri, url, options);
      this.registerWebviewListeners(view);

      this._activeView = view;
    }
  }

  public restore(panel: vscode.WebviewPanel, state: any): void {
    const url = state?.url ?? '';
    const view = HyprCsebView.restore(this.extensionUri, url, panel);
    this.registerWebviewListeners(view);
    this._activeView ??= view;
  }

  private registerWebviewListeners(view: HyprCsebView) {
    view.onDispose(() => {
      if (this._activeView === view) {
        this._activeView = undefined;
      }
    });
  }
}
