import Hook from './class-hook';

const filters: Record<string, Hook> = {};
// const actions: Record<string, Hook> = {};

/**
 * Test if a variable has an empty-ish value.
 *
 * @param input Arguments to merge with default values.
 */
export const isEmpty = (input: unknown) =>
  !input || input === null || (typeof input === 'string' && input.trim() === '');

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
 */
export const partitionArr = <T>(array: T[], predicate: (value: T, index: number) => boolean): [T[], T[]] =>
  // https://stackoverflow.com/a/64093016
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
export const addFilter = (hookName: string, callback: (...args: any) => any, priority = 10) =>
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
 * @param args     Parameters to pass to the callback functions.
 *                 This array is expected to include the to be filtered value at index 0.
 *
 * @returns        The filtered value.
 */
export const applyFilters = (hookName: string, ...args: any): any =>
{
  if (filters[hookName] instanceof Hook)
  {
    args[0] = filters[hookName].applyFilters(...args);
  }

  return args[0];
};