/*
 * This module runs in the MAIN process and should at least contain the application-wide configuration object and your application specifix SQL queries.
 * Just rename this file to `index.ts` and you're good to go.
 *
 * You may include additional custom logic that needs to run in the MAIN process, e.g. database related logic.
 * Using hooks it is possible to expose APIs to your RENDERER logic.
 */

import path from 'path';

import * as core from '../inc/functions-core';
import * as fs from '../inc/functions-fs';
import * as sql from '../inc/functions-sql';
import * as project from '../inc/functions-project';

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

// Filter both project- / and install number.
core.addFilter('project_install_number', install_number => ((install_number ?? '') as string).trim());
core.addFilter('project_project_number', project_number => ((project_number ?? '') as string).trim());

/**
 * Return valid install path basenames for a given install number.
 */
core.addFilter('install_path_basenames', (basenames: string[], number: ProjectAndInstallNumber) =>
{
  return [
    core.applyFilters('project_project_number', number.install_number, { project_number: number.install_number }),
  ];
});

/**
 * Return valid project path basenames for a given project number.
 */
core.addFilter('project_path_basenames', (basenames: string[], number: ProjectAndInstallNumber) =>
{
  return [
    core.applyFilters('project_project_number', number.project_number, { project_number: number.project_number }),
  ];
});

/**
 * Determine if a path is a valid install path for a given install number.
 */
core.addFilter('install_path_is_match', (_isMatch: boolean, potentialInstallPath: string, validInstallPathBasenames: string[]) =>
{
  return validInstallPathBasenames.some(basename => path.basename(potentialInstallPath).endsWith(basename));
});

/**
 * Determine if a path is a valid project path for a given project number.
 */
core.addFilter('project_path_is_match', (_isMatch: boolean, potentialProjectPath: string, validProjectPathBasenames: string[]) =>
{
  return validProjectPathBasenames.some(basename => path.basename(potentialProjectPath).endsWith(basename));
});

/**
 * Logic to create a project folder and return a `Promise<boolean>` whether the folder was created or not.
 */
core.addFilter('create_project_folder', (_promise: Promise<boolean>, project: Project, projectPaths: ReturnType<Window['api']['project']['getProjectPaths']>) =>
{
  return new Promise(resolve =>
  {
    // check permission, then do something ..
    const created = false;

    resolve(created);
  }) as Promise<boolean>;
});

/**
 * Static WHERE clause to fetch projects from the database.
 */
core.addFilter('sql_where_get_projects', (query: string) =>
{
  return query;
});

/**
 * SQL query to fetch multiple projects from the database.
 * The result is expected to be ordered descending by date by default.
 */
core.addFilter('sql_get_projects', (query: string, args: getProjectArgs) =>
{
  query += 'SELECT';

  if (!Array.isArray(args.search_for))
  {
    query += args.single
      ? ' TOP 1'
      : ` TOP ${userConfig.database.maxSelect}`;
  }

  // WHERE ..
  query += core.applyFilters('sql_where_get_projects');

  // project ID ..
  if (Array.isArray(args.project_ids))
  {
    query += `
  AND [projects].[id] IN (${args.project_ids.map(id => `'${sql.sanitizeSql(id.trim())}'`).join(', ')})`;
  }

  // project number ..
  else if (Array.isArray(args.project_numbers))
  {
    query += `
  AND upper([projects].[project_number]) IN (${args.project_numbers.map(nr => `'${sql.sanitizeSql(nr.trim().toUpperCase())}'`).join(', ')})`;
  }

  // children of ..
  else if (!core.isEmpty(args.children_of))
  {
    const install_number = sql.sanitizeSql(args.children_of.trim().toUpperCase());

    query += `
  AND (
    upper([projects].[project_number]) = '${install_number}'
    OR upper([installations].[install_number]) LIKE '${install_number}%'
  )`;
  }

  // deepsearch ..
  else if (Array.isArray(args.search_for))
  {
    if (args.search_for.length)
    {
      query += `
  AND (`;

      args.search_for.forEach((queryItem, index) =>
      {
        queryItem = sql.sanitizeSql(queryItem).toLowerCase();

        if (index > 0) query += `
    AND`;

        const negative = queryItem.startsWith('!');

        if (negative) queryItem = queryItem.substring(1);

        query += `
    (
      lower([projects].[project_number]) ${negative ? 'NOT ' : ''}LIKE '%${queryItem}%' ESCAPE '\\'
      ${negative ? 'AND' : 'OR'}
      lower([projects].[description]) ${negative ? 'NOT ' : ''}LIKE '%${queryItem}%' ESCAPE '\\' COLLATE Latin1_General_CI_AI
      ${negative ? 'AND' : 'OR'}
      lower([relations].[name]) ${negative ? 'NOT ' : ''}LIKE '%${queryItem}%' ESCAPE '\\' COLLATE Latin1_General_CI_AI
    )`;
      });

      query += `
  )`;
    }
  }

  // status ..
  else if (Array.isArray(args.status))
  {
    query += `
  AND [projects].[status] IN (${args.status.map(stat => `'${sql.sanitizeSql(stat.trim())}'`).join(', ')})`;
  }

  // order ..
  query += '\nORDER BY';
  query += args.orderBy !== 'DESC'
    ? `
  [date_start],
  [project_number],
  [install_number]`
    : `
  [date_start] DESC,
  [project_number] DESC,
  [install_number] DESC`;

  return query;
});

core.addFilter('sql_get_planning', (query: string, args: getPlanningArgs) =>
{
  query += `SELECT
  * AS [task_id],
  * AS [parent_id],
  * AS [project_number],
  * AS [task_description],
  * AS [date_start],
  * AS [date_start_actual],
  * AS [date_finish],
  * AS [date_finish_actual],
  * AS [date_delivery]
FROM
  *
WHERE`;

  // project number ..
  query += window.api.core.isEmpty(args.project_number)
    ? `
  AND [planning].[project_number] IS NOT NULL`
    : `
  AND [planning].[project_number] = '${args.project_number}'`;

  // parent id ..
  query += window.api.core.isEmpty(args.parent_id)
    ? `
  AND [planning].[parent_id] IS NULL`
    : `
  AND [planning].[parent_id] = ${args.parent_id}`;

  // order ..
  query += '\nORDER BY';
  query += args.orderBy !== 'DESC'
    ? `
  [project_number],
  [date_start],
  [date_start_actual],
  [date_finish],
  [date_finish_actual],
  [date_delivery]`
    : `
  [project_number] DESC,
  [date_start] DESC,
  [date_start_actual] DESC,
  [date_finish] DESC,
  [date_finish_actual] DESC,
  [date_delivery] DESC`;

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