import path from 'path';
import
{
  app, ipcRenderer,
}
  from 'electron';

/**
 * Sanitizes a string key.
 *
 * @param input String key.
 */
export const sanitizeKey = (input: string) =>
  // eslint-disable-next-line no-useless-escape
  input?.replace(/[^a-z0-9_\-]/giu, '');

/**
 * Escape a string to use in a regular expression.
 *
 * @param input The string.
 */
export const regexEscape = (input: string) =>
  input?.replace(/([\\*+?|{[(,)^$.#])/gu, '\\$1').replace(/\s/gu, '\\s');

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
 * Popup a context-menu.
 *
 * @param menuItems Array of menu-items to popup.
 *
 * @link https://www.electronjs.org/docs/latest/api/menu#render-process
 */
export const contextMenu = (menuItems: Partial<Electron.MenuItem>[]) =>
{
  // Clone array of objects in order to keep original intact.
  // eslint-disable-next-line prefer-object-spread
  const ipcSafeItems = menuItems.map(a => Object.assign({}, a));

  // Remove IPC unsafe properties.
  ipcSafeItems.forEach(menuItem =>
  {
    // A new `click` handler is set by the main process on `send('context-menu-command', menuItem.id)`.
    mapObject(menuItem, prop => typeof prop === 'function' ? null : prop);
  });

  // Handle `click` event and bind it back to the original handler.
  ipcRenderer
    .removeAllListeners('context-menu-command')
    .once('context-menu-command', (_e, id: string) =>
    {
      const clickedItem = menuItems.find(menuItem => menuItem.id === id);

      if (typeof clickedItem?.click === 'function') clickedItem?.click();
    });

  // Send IPC-safe menu items.
  ipcRenderer.send('context-menu', ipcSafeItems);
};

/**
 * Shows a message box.
 *
 * @param options
 */
export const messageBox = (options: Electron.MessageBoxOptions) =>
  ipcRenderer.invoke('message-box', options) as Promise<Electron.MessageBoxReturnValue>;