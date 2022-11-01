import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
import { HyprCsebManager } from './hyprCsebManager';
import { HyprCsebView } from './hyprCsebView';

declare class URL {
  constructor(input: string, base?: string | URL);
  hostname: string;
}

const localize = nls.loadMessageBundle();

const openApiCommand = 'hyprCseb.api.open';
const showCommand = 'hyprCseb.show';

const enabledHosts = new Set<string>([
  'localhost',
  // localhost IPv4
  '127.0.0.1',
  // localhost IPv6
  '[0:0:0:0:0:0:0:1]',
  '[::1]',
  // all interfaces IPv4
  '0.0.0.0',
  // all interfaces IPv6
  '[0:0:0:0:0:0:0:0]',
  '[::]',
]);

const openerId = 'hyprCseb.open';

export function activate(context: vscode.ExtensionContext) {
  const manager = new HyprCsebManager(context.extensionUri);
  console.log(context.extensionUri);
  context.subscriptions.push(manager);

  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(HyprCsebView.viewType, {
      deserializeWebviewPanel: async (panel, state) => {
        manager.restore(panel, state);
      },
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(showCommand, async (url?: string) => {
      manager.show('https://90.90.77.142:8086');
      // if (!url) {
      //   url = await vscode.window.showInputBox({
      //     placeHolder: localize(
      //       'simpleBrowser.show.placeholder',
      //       'https://example.com'
      //     ),
      //     prompt: localize('simpleBrowser.show.prompt', 'Enter url to visit'),
      //   });
      // }

      // if (url) {
      //   manager.show(url);
      // }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      openApiCommand,
      (
        url: vscode.Uri,
        showOptions?: {
          preserveFocus?: boolean;
          viewColumn: vscode.ViewColumn;
        }
      ) => {
        manager.show(url, showOptions);
      }
    )
  );

  context.subscriptions.push(
    vscode.window.registerExternalUriOpener(
      openerId,
      {
        canOpenExternalUri(uri: vscode.Uri) {
          // We have to replace the IPv6 hosts with IPv4 because URL can't handle IPv6.
          const originalUri = new URL(uri.toString(true));
          if (enabledHosts.has(originalUri.hostname)) {
            return vscode.ExternalUriOpenerPriority.Option;
          }

          return vscode.ExternalUriOpenerPriority.None;
        },
        openExternalUri(resolveUri: vscode.Uri) {
          return manager.show(resolveUri, {
            viewColumn: vscode.window.activeTextEditor
              ? vscode.ViewColumn.Beside
              : vscode.ViewColumn.Active,
          });
        },
      },
      {
        schemes: ['http', 'https'],
        label: localize('openTitle', 'Open in simple browser'),
      }
    )
  );
}
