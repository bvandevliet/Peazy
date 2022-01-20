import { Hook } from './class-hook.js';

/**
 * Adds a callback function to a filter hook.
 *
 * @param hookName The name of the filter hook.
 * @param callback The callback to be run when the filter is applied.
 * @param priority Optional. Used to specify the order in which the functions
 *                 associated with a particular filter are executed.
 *                 Lower numbers correspond with earlier execution,
 *                 and functions with the same priority are executed
 *                 in the order in which they were added to the filter. Default 10.
 */
export const addFilter = (hookName: string, callback: (...args: any) => any, priority = 10) =>
{
  if (undefined === window.filters)
  {
    window.filters = {};
  }
  if (undefined === window.filters[hookName])
  {
    window.filters[hookName] = new Hook();
  }

  window.filters[hookName].addFilter(callback, priority);
};

/**
 * Calls the callback functions that have been added to a filter hook.
 *
 * @param hookName The name of the filter hook.
 * @param args     Parameters to pass to the callback functions.
 *                 This array is expected to include the to be filtered value at index 0.
 *
 * @returns        The filtered value.
 */
export const applyFilters = (hookName: string, ...args: any): any =>
{
  if (undefined !== window.filters && window.filters[hookName] instanceof Hook)
  {
    args[0] = window.filters[hookName].applyFilters(...args);
  }

  return args[0];
};