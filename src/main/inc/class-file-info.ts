// import path from 'path';
import fs from 'fs';

/**
 * Wrapper class for file and directory info.
 */
export default class FileInfo
{
  // We can only expose properties, not methods via the contextBridge :(

  readonly fullPath;

  private _stats;

  readonly isFile;
  readonly isDirectory;
  readonly size;
  readonly created;
  readonly modified;

  constructor (fullPath: string)
  {
    this.fullPath = fullPath;

    this._stats = fs.lstatSync(this.fullPath);

    this.isFile = this._stats.isFile();
    this.isDirectory = this._stats.isDirectory();
    this.size = this._stats.size;
    this.created = this._stats.ctime;
    this.modified = this._stats.mtime;
  }
}