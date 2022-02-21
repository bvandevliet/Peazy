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
    icon: './src/renderer/assets/img/cm_folder.png',
    click: () =>
    {
      const projectPaths = window.api.project.getProjectPaths(number).projectPaths;

      if (!projectPaths.length || !window.api.fs.openNative(projectPaths[projectPaths.length - 1]))
      {
        window.api.core.messageBox({
          type: 'warning',
          title: 'Project folder',
          message: `Project folder for "${number.project_number}" could not be found.`,
        });
      }
    },
  };
};

export const copyProjectPath = (number: ProjectAndInstallNumber): Partial<Electron.MenuItem> =>
{
  return {
    id: 'copyProjectPath',
    label: 'Copy project path',
    icon: './src/renderer/assets/img/cm_copypath.png',
    click: () =>
    {
      const projectPaths = window.api.project.getProjectPaths(number).projectPaths;

      if (projectPaths.length)
      {
        html.copyText(projectPaths[projectPaths.length - 1]);
      }
      else
      {
        window.api.core.messageBox({
          type: 'warning',
          title: 'Project folder',
          message: `Project folder for "${number.project_number}" could not be found.`,
        });
      }
    },
  };
};

export const openFileNative = (filePath: string): Partial<Electron.MenuItem> =>
{
  return {
    id: 'openFileNative',
    label: 'Open file',
    icon: './src/renderer/assets/img/cm_open.png',
    click: () => window.api.fs.openNative(filePath),
  };
};