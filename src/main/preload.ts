import
{
  contextBridge,
}
  from 'electron';

import * as core from './inc/functions-core';
import * as fs from './inc/functions-fs';

/**
 * The APIs to expose to the global Window object.
 */
export const API =
{
  gc: global.gc,
  core,
  fs,
};

/**
 * Expose the APIs using ContextBridge.
 *
 * @link https://www.electronjs.org/docs/latest/tutorial/context-isolation
 */
contextBridge.exposeInMainWorld('api', API);

/*
 * All of the Node.js APIs are available in the preload process.
 * It has the same sandbox as a Chrome extension.
 */

/**
 * Print version information to the browser window example.
 *
 * @link https://www.electronjs.org/docs/latest/tutorial/quick-start
 */
window.addEventListener('DOMContentLoaded', () =>
{
  const replaceText = (selector: string, text: string) =>
  {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron'])
  {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});