import path from 'path';
import fs from 'fs';

import
{
  shell, ipcRenderer,
}
  from 'electron';

// import * as core from './functions-core';

/**
 * Sanitize a string for use in a filename.
 *
 * @param input The input string.
 */
export const sanitizeFilename = (input: string) =>
  input.replace(/[\\/:*?"<>]/giu, '');

/**
 * Start Native File Drag & Drop.
 *
 * @param filePath The path to the file being dragged.
 *
 * @link https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop
 */
export const startDrag = (filePath: string) =>
{
  ipcRenderer.send('ondragstart', filePath);
};

/**
 * Show the given file or folder in a file manager. If possible, select the file.
 *
 * @param filePath
 *
 * @returns Whether the file or folder exists.
 */
export const showInFolder = (filePath: string) =>
{
  if (!fs.existsSync(filePath)) return false;

  shell.showItemInFolder(filePath); return true;
};

/**
 * Open the given file or folder in the desktop's default manner.
 *
 * @param pathLike
 *
 * @returns Whether the file or folder exists.
 */
export const openNative = (pathLike: string) =>
{
  if (!fs.existsSync(pathLike)) return false;

  shell.openPath(pathLike); return true;
};