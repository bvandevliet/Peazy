// import path from 'path';
// import fs from 'fs';
import
{
  /* app, */ipcRenderer,
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