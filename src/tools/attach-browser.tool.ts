import { remote } from 'webdriverio';
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types';
import type { ToolDefinition } from '../types/tool';
import { z } from 'zod';
import { getBrowser } from './browser.tool';

export const attachBrowserToolDefinition: ToolDefinition = {
  name: 'attach_browser',
  description: `Attach to a Chrome instance already running with --remote-debugging-port.

Start Chrome first:
  macOS:  open -a "Google Chrome" --args --remote-debugging-port=9222
  Linux:  google-chrome --remote-debugging-port=9222

Then call attach_browser() to hand control to the AI. All other tools (navigate, click, get_visible_elements, etc.) will work on the attached session. Use close_session() to detach without closing Chrome.`,
  inputSchema: {
    port: z.number().default(9222).describe('Chrome remote debugging port (default: 9222)'),
    host: z.string().default('localhost').describe('Host where Chrome is running (default: localhost)'),
    navigationUrl: z.string().optional().describe('URL to navigate to immediately after attaching'),
  },
};

export const attachBrowserTool: ToolCallback = async ({
  port = 9222,
  host = 'localhost',
  navigationUrl,
}: {
  port?: number;
  host?: string;
  navigationUrl?: string;
}): Promise<CallToolResult> => {
  try {
    const state = (getBrowser as any).__state;

    const browser = await remote({
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          debuggerAddress: `${host}:${port}`,
        },
      },
    });

    const { sessionId } = browser;
    state.browsers.set(sessionId, browser);
    state.currentSession = sessionId;
    state.sessionMetadata.set(sessionId, {
      type: 'browser',
      capabilities: browser.capabilities,
      isAttached: true,
    });

    if (navigationUrl) {
      await browser.url(navigationUrl);
    }

    const title = await browser.getTitle();
    const url = await browser.getUrl();

    return {
      content: [{
        type: 'text',
        text: `Attached to Chrome on ${host}:${port}\nSession ID: ${sessionId}\nCurrent page: "${title}" (${url})`,
      }],
    };
  } catch (e) {
    return {
      content: [{ type: 'text', text: `Error attaching to browser: ${e}` }],
    };
  }
};
