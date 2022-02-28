import * as html from './functions-html.js';

export const separator: Partial<Electron.MenuItem> =
{
  type: 'separator',
};

export const openProjectInNewTab = (click: () => void) =>
{
  return {
    id: 'openProjectInNewTab',
    label: 'Open in new tab',
    icon: './src/renderer/assets/img/cm_add.png',
    click: click,
  };
};

export const openProjectFolder = (number: ProjectAndInstallNumber) =>
{
  return {
    id: 'openProjectFolder',
    label: 'Open project folder',
    icon: './src/renderer/assets/img/cm_folder.png',
    click: () =>
    {
      const projectPaths = window.api.project.getProjectPaths(number);

      if (!projectPaths.projectPaths.length || !window.api.fs.openNative(projectPaths.projectPaths[projectPaths.projectPaths.length - 1]))
      {
        window.api.core.messageBox({
          type: 'warning',
          title: 'Project folder',
          message: `Project folder for "${number.project_number}" could not be found.`,
          buttons: ['OK', 'Create'], // add permission check !!
        })
          .then(messageBoxReturnValue =>
          {
            if (messageBoxReturnValue.response === 1)
            {
              window.api.core.applyFilters('create_project_folder',
                new Promise(resolve => resolve(false)) as Promise<boolean>,
                number,
                projectPaths)
                .then(created => created ? openProjectFolder(number).click() : null);
            }
          });
      }
    },
  };
};

export const copyProjectPath = (number: ProjectAndInstallNumber) =>
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

export const openFileNative = (filePath: string) =>
{
  return {
    id: 'openFileNative',
    label: 'Open file',
    icon: './src/renderer/assets/img/cm_open.png',
    click: () => window.api.fs.openNative(filePath),
  };
};

export const showInExplorer = (filePath: string) =>
{
  return {
    id: 'showInExplorer',
    label: 'Show in Explorer',
    icon: './src/renderer/assets/img/cm_folder.png',
    click: () => window.api.fs.showInFolder(filePath),
  };
};

export const openFolderNative = (filePath: string) =>
{
  return {
    id: 'openFolderNative',
    label: 'Open in Explorer',
    icon: './src/renderer/assets/img/cm_folder.png',
    click: () => window.api.fs.openNative(filePath),
  };
};

export const copyPath = (filePath: string) =>
{
  return {
    id: 'copyPath',
    label: 'Copy path',
    icon: './src/renderer/assets/img/cm_copypath.png',
    click: () => html.copyText(filePath),
  };
};