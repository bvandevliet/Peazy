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
 * Sanitizes a string key.
 *
 * @param input String key.
 */
export const sanitizeKey = (input: string) =>
  // eslint-disable-next-line no-useless-escape
  input?.replace(/[^a-z0-9_\-]/giu, '');

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
 * @param input A value to test.
 */
export const isEmpty = (input: any) =>
  input === undefined || input === null || (typeof input === 'string' && input?.trim() === '');

/**
 * Like `Array.map()` but for object types.
 *
 * @param input    The object to map.
 * @param callback Called one time for each element in the object.
 */
export const mapObject = <T> (input: Record<any, T>, callback: (value: T) => any): Record<any, any> =>
{
  for (const [key, value] of Object.entries(input))
  {
    input[key] = callback(value);
  }

  return input;
};

/**
 * Merge user defined default values with an object.
 *
 * @param input    The object to merge default values with.
 * @param defaults Object that serves as the defaults.
 */
export const parseArgs = <T> (input: T, defaults: T): T =>
{
  for (const [key, value] of Object.entries(defaults))
  {
    if (isEmpty((input as Record<any, unknown>)[key])) (input as Record<any, unknown>)[key] = value;
  }

  return input;
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