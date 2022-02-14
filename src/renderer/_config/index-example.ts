/*
 * This module runs in the RENDERER process and may contain any additional logic including hooks to alter the application's behaviour.
 * Just rename this file to `index.ts` and you're good to go.
 *
 * You may include additional custom logic that needs to run in the RENDERER process, e.g. layout related logic.
 */

/**
 * Filter the context-menu for clickable project number entries.
 */
window.api.core.addFilter('project_entry_contextmenu', (menuItems: Partial<Electron.MenuItem>[], project: Project) =>
{
  return menuItems;
});

/**
 * Filter the data shown at the project info tab.
 */
window.api.core.addFilter('project_info_tbodies', (tbodies: tableCellItem[][][], project: Project) =>
{
  return tbodies;
});

/**
 * Filter the project price to allow for digit grouping and currency symbols.
 */
window.api.core.addFilter('project_price', (price: number, project: Project) =>
{
  return `€ ${
    price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
});