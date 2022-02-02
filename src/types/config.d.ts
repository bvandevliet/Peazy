// eslint-disable-next-line no-shadow
interface Window
{
  /**
   * User configuration.
   */
  userConfig: {
    /**
     * Database connection.
     */
    database: {
      /**
       * A friendly name for this database connection.
       */
      friendlyName: string,
      /**
       * Hostname to connect to.
       */
      server: string,
      /**
       * Database to connect to.
       */
      database: string,
      /**
       * User name to use for authentication.
       */
      username: string,
      /**
       * Password to use for authentication.
       */
      password: string,
      /**
       * Port to connect to (default: 1433).
       */
      port: number,
      /**
       * The maximum amount of rows fetched in a SELECT query.
       */
      maxSelect: number,
    },
    /**
     * Filesystem related configuration.
     */
    filesystem: {
      /**
       * Files to ignore in the project explorer.
       */
      ignoreFiles: string,
      /**
       * Directories to search for project folders.
       */
      lookupDirectories: string[],
    },
  },
}