/*
 * This module runs in the MAIN process and should only contain the application-wide configuration object.
 * Just rename this file to `index.ts` and you're good to go.
 */

/**
 * Application-wide configuration.
 * This object is mandatory.
 */
export const userConfig: userConfig =
{
  database: {
    friendlyName: null,
    server: null,
    database: null,
    username: null,
    password: null,
    port: null,
    maxSelect: null,
  },
  filesystem: {
    ignoreFiles: null,
    lookupDirectories: [],
  },
};