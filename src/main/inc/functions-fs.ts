// Load user configuration.
import { userConfig } from '../_config';

import path from 'path';
import fs from 'fs';

import
{
  shell, ipcRenderer,
}
  from 'electron';

import FileInfo from './class-file-info';

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
  filePath = path.normalize(filePath);

  ipcRenderer.send('ondragstart', filePath);
};

/**
 * Fetch a path's associated icon.
 *
 * @param filePath
 * @param options
 *
 * @return The data URL of the image.
 */
export const getFileIcon = (filePath: string, options: Electron.FileIconOptions = { size: 'small' }): Promise<string> =>
{
  filePath = path.normalize(filePath);

  return new Promise(resolve =>
  {
    ipcRenderer
      .once(`file-icon-data-${filePath}`, (_e, dataUrl: string) => resolve(dataUrl));

    ipcRenderer.send('file-icon', filePath, options);
  });
};

/**
 * A regex pattern to test if a file should be ignored.
 */
export const ignoreFiles = userConfig.filesystem.ignoreFiles;

export const existsSync = fs.existsSync;
export const readdirSync = fs.readdirSync;

/**
 * Get file or directory information.
 *
 * @param filePath Full path to the file or directory.
 *
 * @returns FileInfo
 */
export const getFileInfo = (filePath: string) => new FileInfo(filePath);

/**
 * Show the given file or folder in a file manager. If possible, select the file.
 *
 * @param filePath
 *
 * @returns Whether the file or folder exists.
 */
export const showInFolder = (filePath: string) =>
{
  filePath = path.normalize(filePath);

  if (!fs.existsSync(filePath)) return false;

  shell.showItemInFolder(filePath); return true;
};

/**
 * Open the given file or folder in the desktop's default manner.
 *
 * @param filePath
 *
 * @returns Whether the file or folder exists.
 */
export const openNative = (filePath: string) =>
{
  filePath = path.normalize(filePath);

  if (!fs.existsSync(filePath)) return false;

  shell.openPath(filePath); return true;
};