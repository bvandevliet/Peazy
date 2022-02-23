import * as html from './functions-html.js';

export const separator: Partial<Electron.MenuItem> =
{
  type: 'separator',
};

export const openProjectInNewTab = (click: () => void): Partial<Electron.MenuItem> =>
{
  return {
    id: 'openProjectInNewTab',
    label: 'Open in new tab',
    icon: './src/renderer/assets/img/cm_add.png',
    click: click,
  };
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

export const showInExplorer = (filePath: string): Partial<Electron.MenuItem> =>
{
  return {
    id: 'showInExplorer',
    label: 'Show in Explorer',
    icon: './src/renderer/assets/img/cm_folder.png',
    click: () => window.api.fs.showInFolder(filePath),
  };
};

export const openFolderNative = (filePath: string): Partial<Electron.MenuItem> =>
{
  return {
    id: 'openFolderNative',
    label: 'Open in Explorer',
    icon: './src/renderer/assets/img/cm_folder.png',
    click: () => window.api.fs.openNative(filePath),
  };
};

export const copyPath = (filePath: string): Partial<Electron.MenuItem> =>
{
  return {
    id: 'copyPath',
    label: 'Copy path',
    icon: './src/renderer/assets/img/cm_copypath.png',
    click: () => html.copyText(filePath),
  };
};