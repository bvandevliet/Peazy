/*
 * This module runs in the MAIN process and should at least contain the application-wide configuration object.
 * Just rename this file to `index.ts` and you're good to go.
 *
 * You may include additional custom logic that needs to run in the MAIN process, e.g. database related logic.
 * Using hooks it is possible to expose APIs to your RENDERER logic.
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
    lookupPaths: [],
    docsServer: {
      server: null,
      username: null,
      password: null,
    },
  },
};