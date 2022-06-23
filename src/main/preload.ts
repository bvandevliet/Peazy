// Initiate user hooks.
import initHooks from './_config/hooks'; initHooks();

import path from 'path';

import
{
  contextBridge,
}
  from 'electron';

import * as _hooks from './inc/functions-hooks';
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
  ABSPATH: path.resolve(path.join(__dirname, '../../')),
  path,
  hooks: {
    doActions: _hooks.doActions,
    applyFilters: _hooks.applyFilters,
  },
  core,
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