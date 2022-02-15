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
    click: () => console.log(window.api.project.getProjectPaths(number)),
  };
};

export const copyProjectPath = (number: ProjectAndInstallNumber): Partial<Electron.MenuItem> =>
{
  return {
    id: 'copyProjectPath',
    label: 'Copy project path',
    icon: null,
    click: () => console.log(window.api.project.getProjectPaths(number)),
  };
};