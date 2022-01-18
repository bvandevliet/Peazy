// import * as path from 'path';
// import * as fs from 'fs';
import
{
  contextBridge, ipcRenderer,
}
  from 'electron';

/**
 * Print version information to the browser window.
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

/**
 * The API to expose to the global Window object
 */
export const API =
{
  /**
   * Start Native File Drag & Drop.
   *
   * @param filePath The path to the file being dragged.
   */
  startDrag: (filePath: string) =>
  {
    ipcRenderer.send('ondragstart', filePath);
  },
};

/**
 * Expose the API using ContextBridge.
 *
 * @link https://www.electronjs.org/docs/latest/tutorial/context-isolation
 */
contextBridge.exposeInMainWorld('api', API);

/*
 * All of the Node.js APIs are available in the preload process.
 * It has the same sandbox as a Chrome extension.
 */