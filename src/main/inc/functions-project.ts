import { userConfig } from '../_config';

import Database from './class-database';
import * as core from './functions-core';

/* eslint-disable camelcase */

const database: Database = new Database(
  {
    server: userConfig.database.server,
    authentication: {
      options: {
        userName: userConfig.database.username,
        password: userConfig.database.password,
      },
      type: 'default',
    },
    options: {
      database: userConfig.database.database,
      port: userConfig.database.port ?? 1433,
      encrypt: true,
      trustServerCertificate: true,
      useColumnNames: true,
    },
  },
);

/**
 * Fetch multiple projects from the database.
 *
 * @param args  An object providing arguments, passed and handled by the query filter.
 * @param onRow Called on each returned row.
 */
export const getProjects = (args: getProjectArgs, onRow: (project: Project) => void): Promise<number> =>
{
  /**
   * Filters the SQL query string for this request.
   */
  const query = core.applyFilters('sql_get_projects', '' as string, args);

  return new Promise(resolve =>
    // Only proceed if no `condition` was set or it evaluates to `true`.
    resolve(typeof args.condition !== 'function' || args.condition()))
    .then(proceed => proceed
      ? database.execSql(query, columns =>
      {
        const project = core.mapObject(columns, column => column.value) as Project;

        // Only trigger callback if no `filter` was set or it evaluates to `true`.
        if (typeof args.filter !== 'function' || args.filter(project)) onRow(project);
      })
      : 0);
};

/**
 * Fetch one project from the database.
 *
 * @param args An object providing either a project ID or a project number.
 */
export const getProject = (args: ProjectId): Promise<Project> =>
{
  const getArgs: getProjectArgs =
  {
    single: true,
    project_ids: !core.isEmpty(args.project_id) ? [args.project_id] : null,
    project_numbers: core.isEmpty(args.project_id) && !core.isEmpty(args.project_number) ? [args.project_number] : null,
  };

  // Last record wins, but there should only be one result.
  let _project: Project = null;

  return getProjects(getArgs, project => _project = project).then(() => _project).catch(err => err);
};

/**
 * Fetch documents that are attached to this `Project` instance.
 *
 * @param onRow Called on each returned row.
 */
export const getAttachedDocuments = (args: ProjectId, onRow: (doc: AttachedDocument) => void): Promise<number> =>
{
  /**
   * Filters the SQL query string for this request.
   */
  const query = core.applyFilters('sql_get_attached_documents', '' as string, args);

  return database.execSql(query, columns => onRow(core.mapObject(columns, column => column.value) as AttachedDocument));
};

/**
 * Fetch resource hours worked on this `Project` instance.
 *
 * @param onRow Called on each returned row.
 */
export const getWorkHours = (args: ProjectId, onRow: (doc: WorkHours) => void): Promise<number> =>
{
  /**
   * Filters the SQL query string for this request.
   */
  const query = core.applyFilters('sql_get_work_hours', '' as string, args);

  return database.execSql(query, columns => onRow(core.mapObject(columns, column => column.value) as WorkHours));
};