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
    click: null,
  };
};

export const copyProjectPath = (number: ProjectOrInstall): Partial<Electron.MenuItem> =>
{
  return {
    id: 'copyProjectPath',
    label: 'Copy project path',
    icon: null,
    click: null,
  };
};