import { ColumnValue } from 'tedious';

import { userConfig } from '../_config';

import Database from './class-database';
import * as core from './functions-core';

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
 * Fetch one project from the database.
 *
 * @param args An object providing either a project ID or a project number.
 */
export const getProject = (args: ProjectId): Promise<Project> =>
{
  /**
   * Filters the SQL query string for this request.
   */
  const query = core.applyFilters('sql_get_project', '' as string, args);

  return new Promise((resolve, reject) =>
  {
    // Last record wins, but there should only be one result.
    let _columns: Record<string, ColumnValue>;

    database.execSql(query, columns => _columns = columns)
      .then(rowCount => rowCount > 0
        ? resolve(core.mapObject(_columns, column => column.value) as Project)
        : reject(new Error('Project does not exist.')))
      .catch(err => reject(err));
  });
};

/**
 * Fetch multiple projects from the database.
 *
 * @param args  An object providing optional arguments, passed and handled by the query filter.
 * @param onRow Called on each returned row.
 */
export const getProjects = (args: Record<string, any>, onRow: (project: Project) => void): Promise<number> =>
{
  /**
   * Filters the SQL query string for this request.
   */
  const query = core.applyFilters('sql_get_projects', '' as string, args);

  return database.execSql(query, columns => onRow(core.mapObject(columns, column => column.value) as Project));
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