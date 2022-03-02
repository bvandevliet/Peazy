import { userConfig } from '../_config';

import path from 'path';
import fs from 'fs';

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
 * Max amount of rows a database request should return.
 */
export const maxSelect = userConfig.database.maxSelect;

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
      orderBy: 'DESC',
    });

  /**
   * Filters the SQL query string for this request.
   */
  const query = core.applyFilters('sql_get_projects', '' as string, args);

  return database.execSql(query, columns =>
  {
    onRow(core.mapObject(columns, column => column.value) as Project);
  });
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
    project_ids: !core.isEmpty(args.project_id) ? [args.project_id] : undefined,
    project_numbers: !core.isEmpty(args.project_number) ? [args.project_number] : undefined,
    orderBy: 'DESC',
  };

  // Last record wins, but there should only be one result.
  let _project: Project = null;

  return getProjects(getArgs, project => _project = project).then(() => _project).catch(err => err);
};

/**
 * Fetch a project and its children from the database.
 *
 * The project itself is also included to reduce requests for when building up the project tree,
 * since then we can directly obtain the next parent installation from it.
 *
 * @param project_number The parent's project number.
 * @param onRow          Called on each returned row.
 */
export const getProjectAndChildren = (project_number: Project['project_number'], onRow: (project: Project) => void): Promise<number> =>
{
  const getArgs: getProjectArgs =
  {
    single: false,
    children_of: project_number,
    orderBy: 'ASC',
  };

  return getProjects(getArgs, onRow);
};

/**
 * Get the top-most install project with defined `children` properties
 * down to the given entry project and its children if any.
 *
 * @param entryProject The project to start building the tree up from.
 */
export const getProjectTree = async (entryProject: Project) =>
{
  /**
   * Start iteration from the project number so we also fetch these children instead of only building up the tree.
   * However since the first install number is an actual project number,
   * it does not need to be filtered here, which also decreases the fail-chance of not finding the project.
   */
  let firstIteration = true;
  let install_project = entryProject.project_number;

  /**
   * Holds the previous install project.
   */
  let prevProject = entryProject;

  // The tree walker loop.
  while (!core.isEmpty(install_project))
  {
    let currentProject: Project = null;

    const children: Project[] = [];

    const prev_project_number = core.applyFilters('project_project_number', prevProject.project_number);

    await getProjectAndChildren(install_project, project =>
    {
      const this_project_number = core.applyFilters('project_project_number', project.project_number);

      // Make sure further tests are performed on filtered values.
      if (firstIteration) { install_project = core.applyFilters('project_project_number', install_project); }

      // If given project passes by.
      if (this_project_number === install_project)
      {
        // Set current project.
        currentProject = project;

        // Filter the next parent project number.
        const this_install_number = core.applyFilters('project_project_number', project.install_number);

        const isChild = core.applyFilters('project_is_child', !core.isEmpty(this_install_number) && this_install_number !== this_project_number, project);

        // Define next interation.
        install_project = isChild ? this_install_number : null;
      }

      // Don't define (entry) project as its own infinite child.
      else if (install_project !== prev_project_number)
      {
        if (project.project_id !== prevProject.project_id)
        {
          // Push child.
          children.push(project);
        }
        else
        {
          // Push previous project as child to keep the tree intact.
          children.push(prevProject);
        }
      }
    });

    // If parent project does not exist.
    if (currentProject === null)
    {
      // If is first iteration, previous project is entry project, use it as is.
      if (firstIteration)
      {
        currentProject = prevProject;
      }
      else
      {
        // Fallback to the previous project's installation values.
        // And set top-most install project as "non-existing".
        currentProject =
        {
          project_id: null, // `null` indicates it doesn't exist.
          project_number: prevProject.install_number, // prevChild
          project_description: prevProject.install_description,
          customer_id: prevProject.customer_id,
          customer_name: prevProject.customer_name,
          status_id: '!EXISTS',
          status_name: 'This project doesn\'t exist',
        };
      }

      // Force stop the loop.
      install_project = null;
    }

    // Set child projects.
    currentProject.children = children;

    // Set previous project.
    prevProject = currentProject;

    // Not the first iteration anymore.
    firstIteration = false;
  }

  // Return the last / top-most install project including the `children` property.
  return prevProject;
};

/**
 * Find project directories.
 *
 * @param number Install- and/or project number.
 */
export const getProjectPaths = (number: ProjectAndInstallNumber) =>
{
  const validPaths =
  {
    installPaths: [] as string[],
    projectPaths: [] as string[],
  };

  // If install number is empty, make it equal to the project number.
  if (core.isEmpty(number.install_number)) number.install_number = number.project_number;

  const validProjectPathBasenames =
    core.applyFilters('project_path_basenames', [number.project_number], number).filter(basename => !core.isEmpty(basename));
  const validInstallPathBasenames =
    core.applyFilters('install_path_basenames', [number.install_number], number).filter(basename => !core.isEmpty(basename));

  /**
   * Performs the lookup for project folders, recursive for install folders.
   *
   * @param lookupPath     A Path to look in for existing project folders.
   * @param deepValidation Whether to perform a thorough lookup, more expensive.
   */
  const dirLookupWalker = (lookupPath: string, deepValidation = false) =>
  {
    if (!deepValidation)
    {
      validProjectPathBasenames.forEach(projectBasename =>
      {
        const potentialPath = path.join(lookupPath, projectBasename);

        if (fs.existsSync(potentialPath) && fs.statSync(potentialPath).isDirectory())
        {
          validPaths.projectPaths.push(potentialPath);
        }
      });

      validInstallPathBasenames.forEach(installBasename =>
      {
        const potentialPath = path.join(lookupPath, installBasename);

        if (fs.existsSync(potentialPath) && fs.statSync(potentialPath).isDirectory())
        {
          validPaths.installPaths.push(potentialPath);

          // Recursive deep lookup install dir.
          dirLookupWalker(potentialPath, true);
        }
      });

      return;
    }

    // else (deepValidation === true) { ..

    if (!fs.existsSync(lookupPath)) return;
    if (!fs.statSync(lookupPath).isDirectory()) return;

    const potentialDirs = fs.readdirSync(lookupPath)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    potentialDirs.forEach(potentialDir =>
    {
      const potentialPath = path.join(lookupPath, potentialDir);

      if (
        !core.isEmpty(number.project_number) && fs.statSync(potentialPath).isDirectory() &&
        core.applyFilters('project_path_is_match', false, potentialPath, validProjectPathBasenames)
      )
      {
        validPaths.projectPaths.push(potentialPath);
      }

      if (
        !core.isEmpty(number.install_number) && fs.statSync(potentialPath).isDirectory() &&
        core.applyFilters('install_path_is_match', false, potentialPath, validInstallPathBasenames)
      )
      {
        validPaths.installPaths.push(potentialPath);

        // Recursive deep lookup install dir.
        dirLookupWalker(potentialPath, true);
      }
    });
  };

  // Define the initial lookup dirs and start the lookup.
  userConfig.filesystem.lookupPaths.forEach(lookupPath =>
  {
    let lookupPaths = [lookupPath];

    // Support one wildcard level.
    if (lookupPath.endsWith('*'))
    {
      lookupPath = path.dirname(lookupPath);

      if (!fs.existsSync(lookupPath)) return;
      if (!fs.statSync(lookupPath).isDirectory()) return;

      lookupPaths = fs.readdirSync(lookupPath)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        .map(lookupSubDir => path.join(lookupPath, lookupSubDir));
    }

    // eslint-disable-next-line no-shadow
    lookupPaths.forEach(lookupPath => dirLookupWalker(lookupPath));
  });

  return validPaths;
};

/**
 * Fetch planning tasks from the database.
 *
 * @param args  An object providing arguments, passed and handled by the query filter.
 * @param onRow Called on each returned row.
 */
export const getProjectPlanningTasks = (args: getPlanningArgs, onRow: (planning: PlanningTask) => void) =>
{
  args = core.parseArgs(args,
    {
      orderBy: 'ASC',
    });

  /**
   * Filters the SQL query string for this request.
   */
  const query = core.applyFilters('sql_get_planning', '' as string, args);

  return database.execSql(query, columns =>
  {
    onRow(core.mapObject(columns, column => typeof column.value === 'string' ? column.value.trim() : column.value) as PlanningTask);
  });
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
export const getWorkHours = (args: ProjectId, onRow: (hours: WorkHours) => void): Promise<number> =>
{
  /**
   * Filters the SQL query string for this request.
   */
  const query = core.applyFilters('sql_get_work_hours', '' as string, args);

  return database.execSql(query, columns => onRow(core.mapObject(columns, column => column.value) as WorkHours));
};