/*
 * This module runs in the RENDERER process and may contain any additional logic including hooks to alter the application's behaviour.
 * Just rename this file to `index.ts` and you're good to go.
 */

/**
 * SQL query to fetch one project from the database.
 */
window.api.core.addFilter('sql_get_project', (query: string, args: AtLeastOne<Pick<ProjectInfo, 'project_id' | 'project_number'>>) =>
{
  return query;
});

/**
 * SQL query to fetch multiple projects from the database.
 */
window.api.core.addFilter('sql_get_projects', (query: string, args: Record<string, any>) =>
{
  return query;
});

/**
 * SQL query to fetch documents that are attached to a project.
 */
window.api.core.addFilter('sql_get_attached_documents', (query: string, projectInfo: ProjectInfo) =>
{
  return query;
});

/**
 * SQL query to fetch resource hours worked on a project.
 */
window.api.core.addFilter('sql_get_work_hours', (query: string, projectInfo: ProjectInfo) =>
{
  return query;
});