import path from 'path';
import
{
  app,
}
  from 'electron';

import Hook from './class-hook';

const filters: Record<string, Hook> = {};
// const actions: Record<string, Hook> = {};

/**
 * Natively load another script.
 *
 * @param           url           Url to the script, relative to the root directory.
 * @param           callback      An optional callback to run when the script is loaded.
 * @param {Object}  options       Additional options.
 * @param {boolean} options.async By default, all requests are sent synchronously.
 *
 * @link https://stackoverflow.com/a/950146
 */
export const loadScript = (url: string, callback?: (this: GlobalEventHandlers, e: Event) => any, options = { async: false }) =>
{
  const script = document.createElement('script');

  script.type = 'text/javascript';
  script.src = path.join(app.getAppPath(), url);
  script.async = options.async;

  script.onload = callback ?? null;
  document.head.appendChild(script);
};

/**
 * Test if a variable has an empty-ish value.
 *
 * @param input Arguments to merge with default values.
 */
export const isEmpty = (input: unknown) =>
  !input || input === undefined || input === null || (typeof input === 'string' && input.trim() === '');

/**
 * Merge user defined values with defaults.
 *
 * @param input    Arguments to merge with default values.
 * @param defaults Object that serves as the defaults.
 */
export const parseArgs = (input: Record<any, unknown>, defaults: Record<any, unknown> = {}) =>
{
  Object.keys(input).forEach(key => defaults[key] = input[key]);

  return defaults;
};

/**
 * Returns an array of elements split into two groups,
 * the first of which contains elements predicate returns truthy for,
 * the second of which contains elements predicate returns falsey for.
 *
 * @param array     The array to split.
 * @param predicate Called one time for each element in the array.
 *
 * @link https://stackoverflow.com/a/64093016
 */
export const partitionArr = <T> (array: T[], predicate: (value: T, index: number) => boolean): [T[], T[]] =>
  array.reduce((prev, cur, index) => (prev[Number(!predicate(cur, index))].push(cur), prev), [[], []]);

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
export const addFilter = (hookName: string, callback: (value?: any, ...args: any) => any, priority = 10) =>
{
  if (undefined === filters[hookName])
  {
    filters[hookName] = new Hook();
  }

  filters[hookName].addFilter(callback, priority);
};

/**
 * Calls the callback functions that have been added to a filter hook.
 *
 * @param hookName The name of the filter hook.
 * @param value    The value being filtered.
 * @param args     Optional arguments to pass with the callback functions.
 *
 * @returns        The filtered value.
 */
export const applyFilters = <T> (hookName: string, value?: T, ...args: any): T =>
{
  if (filters[hookName] instanceof Hook)
  {
    value = filters[hookName].applyFilters(value, ...args);
  }

  return value;
};