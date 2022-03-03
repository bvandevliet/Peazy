import Hook from './class-hook';

const actions: Record<string, Hook> = {};
const filters: Record<string, Hook> = {};

/**
 * Adds a callback function to an action hook.
 *
 * @param hookName The name of the action hook.
 * @param callback The callback to be run when the action is executed.
 * @param priority Optional. Used to specify the order in which the functions
 *                 associated with a particular action are executed.
 *                 Lower numbers correspond with earlier execution,
 *                 and functions with the same priority are executed
 *                 in the order in which they were added to the action. Default 10.
 */
export const _addAction = (hookName: string, callback: (...args: any) => void, priority = 10) =>
{
  if (undefined === actions[hookName])
  {
    actions[hookName] = new Hook();
  }

  actions[hookName].addAction(callback, priority);
};

/**
 * Calls the callback functions that have been added to an action hook.
 *
 * @param hookName The name of the action hook.
 * @param args     Optional arguments to pass with the callback functions.
 */
export const doActions = (hookName: string, ...args: any) =>
{
  if (actions[hookName] instanceof Hook)
  {
    actions[hookName].doActions(...args);
  }
};

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
export const _addFilter = <T> (hookName: string, callback: (value?: T, ...args: any) => T, priority = 10) =>
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