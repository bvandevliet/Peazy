import path from 'path';
import fs from 'fs';
import
{
  app,
}
  from 'electron';

import * as core from './functions-core';

/**
 * Configuration file handler.
 */
export default class ConfigFile
{
  /**
   * Parse a json file.
   *
   * @param filePath Path to the json config file.
   * @param defaults Object that serves as the defaults.
   */
  static parseConfigFile (filePath: fs.PathLike, defaults: Record<any, unknown> = {}): Record<any, unknown>
  {
    try
    {
      return core.parseArgs(JSON.parse(fs.readFileSync(filePath).toString()), defaults);
    }
    catch (err)
    {
      return defaults;
    }
  }

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
    this._data = ConfigFile.parseConfigFile(this._path, defaults);
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
}