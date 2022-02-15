import * as html from './functions-html.js';

export const separator: Partial<Electron.MenuItem> =
{
  type: 'separator',
};

export const openProjectFolder = (number: ProjectAndInstallNumber): Partial<Electron.MenuItem> =>
{
  return {
    id: 'openProjectFolder',
    label: 'Open project folder',
    icon: null,
    click: () =>
    {
      const projectPaths = window.api.project.getProjectPaths(number).projectPaths;

      if (!projectPaths.length || window.api.fs.openNative(projectPaths[projectPaths.length - 1]))
      {
        // SHOW DIALOG BOX "Not found" !!
      }
    },
  };
};

export const copyProjectPath = (number: ProjectAndInstallNumber): Partial<Electron.MenuItem> =>
{
  return {
    id: 'copyProjectPath',
    label: 'Copy project path',
    icon: null,
    click: () =>
    {
      const projectPaths = window.api.project.getProjectPaths(number).projectPaths;

      if (projectPaths.length)
      {
        html.copyText(projectPaths[projectPaths.length - 1]);
      }
      else
      {
        // SHOW DIALOG BOX "Not found" !!
      }
    },
  };
};