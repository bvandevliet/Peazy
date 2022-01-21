// import * as path from 'path';
// import * as fs from 'fs';
import
{
  contextBridge, ipcRenderer,
}
  from 'electron';

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