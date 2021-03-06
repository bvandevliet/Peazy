// Load user configuration.
import { userConfig } from '../_config';

import path from 'path';
import fs from 'fs';

import Database from './class-database';
import * as core from './functions-core';
import * as hooks from './functions-hooks';

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
  const query = hooks.applyFilters('sql_get_projects', '' as string, args);

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
   * it does not need to be filtered, which also decreases the fail-chance of not finding the project.
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
    let givenProject: Project = null;

    const children: Project[] = [];

    const const_install_project = hooks.applyFilters('project_project_number', install_project);

    const prev_project_number = hooks.applyFilters('project_project_number', prevProject.project_number);

    await getProjectAndChildren(install_project, project =>
    {
      const this_project_number = hooks.applyFilters('project_project_number', project.project_number);

      // If given project passes by.
      if (this_project_number === const_install_project)
      {
        // Set current project.
        givenProject = project;

        // Filter the next parent project number.
        const this_install_number = hooks.applyFilters('project_project_number', project.install_number);

        const isChild = hooks.applyFilters('project_is_child', !core.isEmpty(this_install_number) && this_install_number !== this_project_number, project);

        // Define next interation.
        install_project = isChild ? this_install_number : null;
      }

      // Push the project as a child.
      else if (project.project_id !== prevProject.project_id)
      {
        children.push(project);
      }

      // Push previous project as a child to keep the tree intact,
      // but don't define (entry) project as its own infinite child.
      else if (const_install_project !== prev_project_number)
      {
        children.push(prevProject);
      }
    });

    // If parent project does not exist.
    if (givenProject === null)
    {
      // If is first iteration, previous project is entry project, use it as is.
      if (firstIteration)
      {
        givenProject = prevProject;
      }
      else
      {
        // Fallback to the previous project's installation values.
        // And set top-most install project as "non-existing".
        givenProject =
        {
          project_id: null, // `null` indicates it doesn't exist.
          project_number: prevProject.install_number,
          project_description: prevProject.install_description,
          relation_id: prevProject.relation_id,
          relation_name: prevProject.relation_name,
          status_id: '!EXISTS',
          status_name: 'This project doesn\'t exist',
        };
      }

      // Force stop the loop.
      install_project = null;
    }

    // Set child projects.
    givenProject.children = children;

    // Set previous project.
    prevProject = givenProject;

    // Not the first iteration anymore.
    firstIteration = false;
  }

  // Return the last / top-most install project including the `children` property.
  return prevProject;
};

/**
 * Find the locations where project folders are stored.
 */
export const getProjectPathLocations = () =>
{
  let projectLocations: string[] = [];

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
        .filter(lookupSubDir => hooks.applyFilters('is_valid_project_location', true, lookupSubDir))
        .map(lookupSubDir => path.join(lookupPath, lookupSubDir));
    }

    projectLocations = projectLocations.concat(lookupPaths);
  });

  return projectLocations
    // Sort Z to A.
    .sort((b, a) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
};

/**
 * Find project directories.
 *
 * @param number Install- and/or project number.
 */
export const getProjectPaths = (number: ProjectAndInstallNumber, projectLocations = getProjectPathLocations()) =>
{
  const validPaths =
  {
    installPaths: [] as string[],
    projectPaths: [] as string[],
  };

  // If install number is empty, make it equal to the project number.
  if (core.isEmpty(number.install_number)) number.install_number = number.project_number;

  const validProjectPathBasenames =
    hooks.applyFilters('project_path_basenames', [number.project_number], number).filter(basename => !core.isEmpty(basename));
  const validInstallPathBasenames =
    hooks.applyFilters('install_path_basenames', [number.install_number], number).filter(basename => !core.isEmpty(basename));

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
    }

    // deepValidation === true
    else
    {
      if (!fs.existsSync(lookupPath)) return;
      if (!fs.statSync(lookupPath).isDirectory()) return;

      const potentialDirs = fs.readdirSync(lookupPath)
        // Sort Z to A.
        .sort((b, a) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      potentialDirs.forEach(potentialDir =>
      {
        const potentialPath = path.join(lookupPath, potentialDir);

        if (
          !core.isEmpty(number.project_number) && fs.statSync(potentialPath).isDirectory() &&
          hooks.applyFilters('project_path_is_match', false, potentialPath, validProjectPathBasenames)
        )
        {
          validPaths.projectPaths.push(potentialPath);
        }
      });
    }
  };

  // Define the initial lookup dirs and start the lookup.
  projectLocations.forEach(lookupPath => dirLookupWalker(lookupPath));

  // Found project paths.
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
  const query = hooks.applyFilters('sql_get_planning', '' as string, args);

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
  const query = hooks.applyFilters('sql_get_attached_documents', '' as string, args);

  return database.execSql(query, columns => onRow(core.mapObject(columns, column => column.value) as AttachedDocument));
};

/**
 * Fetch resource hours worked on this `Project` instance.
 *
 * @param onRow Called on each returned row.
 */
export const getTimesheets = (args: ProjectId, onRow: (hours: Timesheet) => void): Promise<number> =>
{
  /**
   * Filters the SQL query string for this request.
   */
  const query = hooks.applyFilters('sql_get_timesheets', '' as string, args);

  return database.execSql(query, columns => onRow(core.mapObject(columns, column => column.value) as Timesheet));
};