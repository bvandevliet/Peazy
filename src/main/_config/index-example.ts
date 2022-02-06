/*
 * This module runs in the MAIN process and should at least contain the application-wide configuration object and your application specifix SQL queries.
 * Just rename this file to `index.ts` and you're good to go.
 *
 * You may include additional custom logic that needs to run in the MAIN process, e.g. database related logic.
 * Using hooks it is possible to expose APIs to your RENDERER logic.
 */

import * as core from '../inc/functions-core';
import * as sql from '../inc/functions-sql';

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

/**
 * SQL query to fetch multiple projects from the database.
 * The result is expected to be ordered descending by date by default.
 */
core.addFilter('sql_get_projects', (query: string, args: getProjectArgs) =>
{
  return query;
});

/**
 * SQL query to fetch documents that are attached to a project.
 */
core.addFilter('sql_get_attached_documents', (query: string, project: Project) =>
{
  return query;
});

/**
 * SQL query to fetch resource hours worked on a project.
 */
core.addFilter('sql_get_work_hours', (query: string, project: Project) =>
{
  return query;
});