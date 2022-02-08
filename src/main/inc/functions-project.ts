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
  args = core.parseArgs(args,
    {
      single: false,
      orderBy: 'ASC',
    });

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
 * Get the top-most install project with defined `children` properties
 * down to the given entry project and its children if any.
 *
 * @param entryProject The project to start building the tree up from.
 */
export const getProjectTree = async (entryProject: Project) =>
{
  // Start iteration from the project number so we also fetch these children instead of only building up the tree.
  let install_number = core.applyFilters('project_project_number', entryProject.project_number, entryProject);

  // Holds the previous install project.
  let prevChild = entryProject;

  // Start iteration.
  while (!core.isEmpty(install_number))
  {
    let currentInstall: Project = null;

    const children: Project[] = [];

    await getProjects({ children_of: install_number }, project =>
    {
      const this_project_number = core.applyFilters('project_project_number', project.project_number, project);

      if (install_number === this_project_number)
      {
        // Set current project.
        currentInstall = project;

        const this_install_number = core.applyFilters('project_install_number', project.install_number, project);

        const isChild = core.applyFilters('project_is_child', !core.isEmpty(this_install_number) && this_install_number !== this_project_number, project);

        // Define next interation.
        install_number = isChild ? this_install_number : null;
      }
      else if (this_project_number === core.applyFilters('project_project_number', prevChild.project_number, prevChild))
      {
        // Push previous project as child.
        children.push(prevChild);
      }
      else
      {
        // Push child.
        children.push(project);
      }
    });

    // If install project does not exist.
    if (currentInstall === null)
    {
      // Force stop the loop.
      install_number = null;

      // Set top-most install project as "non-existing".
      currentInstall =
      {
        project_id: null, // `null` indicates it doesn't exist.
        project_number: install_number, // prevChild
        project_description: prevChild.install_description,
        customer_id: prevChild.customer_id,
        customer_name: prevChild.customer_name,
        status_id: '!EXISTS',
        status_name: '!EXISTS',
      };
    }

    // Set children and previous child.
    currentInstall.children = children;
    prevChild = currentInstall;
  }

  // The last / top-most install project including the `children` property.
  return prevChild;
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