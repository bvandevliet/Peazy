import path from 'path';

import
{
  contextBridge,
}
  from 'electron';

// import { userConfig } from './_config/index.js';

import * as core from './inc/functions-core';
import * as fs from './inc/functions-fs';
import * as sql from './inc/functions-sql';
import * as project from './inc/functions-project';

/**
 * The APIs to expose to the global Window object.
 */
export const API =
{
  gc: global.gc,
  core,
  path,
  fs,
  sql,
  project,
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