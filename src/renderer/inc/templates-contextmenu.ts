export const separator: Partial<Electron.MenuItem> =
{
  type: 'separator',
};

export const openProjectFolder = (number: ProjectOrInstall): Partial<Electron.MenuItem> =>
{
  return {
    id: 'openProjectFolder',
    label: 'Open project folder',
    icon: null,
    click: () => console.log(window.api.project.getProjectPaths(number)),
  };
};

export const copyProjectPath = (number: ProjectOrInstall): Partial<Electron.MenuItem> =>
{
  return {
    id: 'copyProjectPath',
    label: 'Copy project path',
    icon: null,
    click: () => console.log(window.api.project.getProjectPaths(number)),
  };
};