import type { ResourceDefinition } from '../types/resource';
import { getBrowser } from '../session/state';

export const capabilitiesResource: ResourceDefinition = {
  name: 'session-current-capabilities',
  uri: 'wdio://session/current/capabilities',
  description: 'Raw capabilities returned by the WebDriver/Appium server for the current session. Use for debugging — shows the actual values the driver accepted, including defaults applied by BrowserStack or Appium.',
  handler: async () => {
    try {
      const browser = getBrowser();
      return {
        contents: [{
          uri: 'wdio://session/current/capabilities',
          mimeType: 'application/json',
          text: JSON.stringify(browser.capabilities, null, 2),
        }],
      };
    } catch (e) {
      return {
        contents: [{
          uri: 'wdio://session/current/capabilities',
          mimeType: 'application/json',
          text: JSON.stringify({ error: String(e) }),
        }],
      };
    }
  },
};
