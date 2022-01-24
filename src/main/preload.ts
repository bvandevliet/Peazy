import * as path from 'path';
import * as fs from 'fs';
// import { exec } from 'child_process';
import
{
  app, contextBridge, ipcRenderer,
}
  from 'electron';

/**
 * Print version information to the browser window.
 *
 * @link https://www.electronjs.org/docs/latest/tutorial/quick-start
 */
window.addEventListener('DOMContentLoaded', () =>
{
  const replaceText = (selector: string, text: string) =>
  {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron'])
  {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

/**
 * The API to expose to the global Window object
 */
export const API =
{
  /**
   * Merge user defined values with defaults.
   *
   * @param input    Arguments to merge with default values.
   * @param defaults Object that serves as the defaults.
   */
  parseArgs: (input: Record<any, unknown>, defaults: Record<any, unknown> = {}) =>
  {
    Object.keys(input).forEach(key => defaults[key] = input[key]);

    return defaults;
  },

  /**
   * Parse a json file.
   *
   * @param filePath Path to the json config file.
   * @param defaults Object that serves as the defaults.
   */
  parseConfigFile: (filePath: fs.PathLike, defaults: Record<any, unknown> = {}): Record<any, unknown> =>
  {
    try
    {
      return API.parseArgs(JSON.parse(fs.readFileSync(filePath).toString()), defaults);
    }
    catch (err)
    {
      return defaults;
    }
  },

  /**
   * Configuration file handler.
   */
  configFile: class
  {
    private _path: fs.PathLike;
    private _data: Record<any, unknown>;

    /**
     * Path to the json config file.
     */
    public get path () { return this._path; }

    /**
     * The json config data.
     */
    public get data () { return this._data; }

    /**
     *
     * @param configName Name of the json config file.
     * @param defaults   Object that serves as the defaults in case the file can't be found or parsed.
     */
    constructor (configName = 'config', defaults: Record<any, unknown> = {})
    {
      this._path = path.join(app.getPath('userData'), `${configName}.json`);
      this._data = API.parseConfigFile(this._path, defaults);
    }

    /**
     * Returns the property value on the `data` object.
     *
     * @param key Property name.
     */
    get (key: any)
    {
      return this._data[key];
    }

    /**
     * Set the property value on the `data` object.
     *
     * @param key Property name.
     */
    set (key: any, val: unknown)
    {
      this._data[key] = val;
      this.write();
    }

    /**
     * Writes the current object state to the linked file.
     */
    write ()
    {
      // If we had used an async API and our app was quit before the
      // async write had a chance to complete, we might lose that data.
      fs.writeFileSync(this._path, JSON.stringify(this._data));
    }
  },

  /**
   * Start Native File Drag & Drop.
   *
   * @param filePath The path to the file being dragged.
   */
  startDrag: (filePath: string) =>
  {
    ipcRenderer.send('ondragstart', filePath);
  },
};

/**
 * Expose the API using ContextBridge.
 *
 * @link https://www.electronjs.org/docs/latest/tutorial/context-isolation
 */
contextBridge.exposeInMainWorld('api', API);

/*
 * All of the Node.js APIs are available in the preload process.
 * It has the same sandbox as a Chrome extension.
 */