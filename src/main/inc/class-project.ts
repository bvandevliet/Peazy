import { ColumnValue } from 'tedious';

import Database from './class-database';
import * as core from './functions-core';

/**
 * Core class used for default database interaction.
 */
export default class Project
{
  /**
   * Holds the project information of this `Project` instance.
   */
  projectInfo: ProjectInfo;

  private _database: Database;

  /**
   *
   * @param database The `Database` instance to use for this `Project` instance.
   */
  constructor (database: Database)
  {
    this._database = database;
  }

  /**
   * Fetch one project from the database.
   *
   * @param database The `Database` instance on which to execute the request.
   * @param args     An object providing either a project ID or a project number.
   */
  static getProject (database: Database, args: AtLeastOne<Pick<ProjectInfo, 'project_id' | 'project_number'>>): Promise<Project>
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
        .then(rowCount =>
        {
          if (rowCount > 0)
          {
            const project = new Project(database);

            project.projectInfo = core.parseArgs(project.projectInfo, core.mapObject(_columns, column => column.value));

            return resolve(project);
          }
          else
          {
            return reject(new Error('Project does not exist.'));
          }
        })
        .catch(err => reject(err));
    });
  }

  /**
   * Fetch multiple projects from the database.
   *
   * @param database The `Database` instance on which to execute the request.
   * @param args     An object providing optional arguments, passed and handled by the query filter.
   * @param onRow    Called on each returned row.
   */
  static getProjects (database: Database, args: Record<string, any>, onRow: (project: Project) => void): Promise<number>
  {
    /**
     * Filters the SQL query string for this request.
     */
    const query = core.applyFilters('sql_get_projects', '' as string, args);

    return database.execSql(query, columns =>
    {
      const project = new Project(database);

      project.projectInfo = core.parseArgs(project.projectInfo, core.mapObject(columns, column => column.value));

      onRow(core.parseArgs(new Project(database), core.mapObject(columns, column => column.value)));
    });
  }

  /**
   * Fetch documents that are attached to this `Project` instance.
   *
   * @param onRow Called on each returned row.
   */
  getAttachedDocuments (onRow: (doc: AttachedDocument) => void): Promise<number>
  {
    /**
     * Filters the SQL query string for this request.
     */
    const query = core.applyFilters('sql_get_attached_documents', '' as string, this.projectInfo);

    return this._database.execSql(query, columns => onRow(core.mapObject(columns, column => column.value) as AttachedDocument));
  }

  /**
   * Fetch resource hours worked on this `Project` instance.
   *
   * @param onRow Called on each returned row.
   */
  getWorkHours (onRow: (doc: WorkHours) => void): Promise<number>
  {
    /**
     * Filters the SQL query string for this request.
     */
    const query = core.applyFilters('sql_get_work_hours', '' as string, this.projectInfo);

    return this._database.execSql(query, columns => onRow(core.mapObject(columns, column => column.value) as WorkHours));
  }
}