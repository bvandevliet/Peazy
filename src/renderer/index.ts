import DateTime from './inc/class-datetime.js';
import Tabs from './inc/class-tabs.js';
import TableList from './inc/class-html-table-list.js';
import Search from './inc/class-search.js';
import projectTab from './tabs/project/_index.js';
import * as html from './inc/functions-html.js';
import * as contextMenu from './inc/templates-contextmenu.js';

/**
 * Prevent default 'dragover' and 'drop' behaviour.
 */
document.addEventListener('dragover drop', e =>
  (e.preventDefault(), e.stopPropagation(), false));

/**
 * Make sure to always copy plain text without styling.
 */
document.addEventListener('copy', e =>
  (e.preventDefault(), e.clipboardData.setData('text/plain', document.getSelection().toString())));

/**
 * Initiate the sidebar category tabs.
 */
const sidebarTabs = new Tabs();

/**
 * Add sidebar categories and activate first.
 */
([
  {
    id: 'browser-projects',
    template: 'tmpl-li-projects',
    callback: $div =>
    {
      $div.append(html.getTemplateClone('tmpl-browser-projects'));
    },
    onclick: () => new Promise(resolve => resolve(true)),
  },
  {
    id: 'browser-customers',
    template: 'tmpl-li-customers',
    callback: () => null,
  },
  {
    id: 'browser-resources',
    template: 'tmpl-li-resources',
    callback: () => null,
  },
  {
    id: 'browser-orders',
    template: 'tmpl-li-orders',
    callback: () => null,
  },
  {
    id: 'browser-articles',
    template: 'tmpl-li-articles',
    callback: () => null,
  },
] as tabItem[]).forEach((sidebarTab, index) =>
{
  sidebarTabs.addTab(sidebarTab, index === 0);
});

/**
 * Append sidebar tabs to the sidebar.
 */
$('#sidebar').append(sidebarTabs.$container);

/**
 * Simple wrapper function to call to exit browsing state.
 */
const stopBrowsing = () =>
{
  $(document.body).removeClass('browsing');
  $('#sidebar input[type=search]:focus').first().trigger('blur');
};

/**
 * The project page tabs.
 */
const mainTabs = new Tabs(true);

/**
 * Append main tabs to the main window.
 */
mainTabs.$ul.addClass('main-tabs');
$('#main').append(mainTabs.$container);

/**
 * The projects table list.
 */
const projectsTable = new TableList($('#table-projects'));

/**
 * The projects table search handler.
 */
const projectSearch = new Search(projectsTable.$table, '>tbody>tr', tr =>
  $(tr).find('>*:not(.ignore-search)').toArray().map(td => td.textContent));

/**
 * Initiate sorting on rendered html tables that support it.
 */
html.makeTableSortable($('table'));

/**
 * Update app title and active rows in the browser according to the current active tab.
 *
 * @param $li The tab being activated. Omit to only update states as is.
 *
 * @return The current active `li`.
 */
export const updateActiveStates = ($li?: JQuery<HTMLLIElement>) =>
{
  // First, deactivate all rows.
  const $trAll = projectsTable.$table.find('>tbody>tr')
    .removeClass(['is-opened', 'is-selected']);

  // Get an array of currently opened tab ID's.
  const tabsOpened = mainTabs.$ul.find('>li').map(function ()
  {
    return $(this).attr('tab-id');
  })
    .toArray();

  // Update opened rows.
  if (tabsOpened.length)
  {
    $trAll.filter(function ()
    {
      return tabsOpened.includes($(this).attr('row-id'));
    })
      .addClass('is-opened');
  }

  // The current active tab.
  $li = $li ?? mainTabs.activeTab.$li;

  // The current active tab ID.
  const tabActiveId = $li.attr('tab-id');

  // Update current active row.
  if (!window.api.core.isEmpty(tabActiveId))
  {
    $trAll.filter(function ()
    {
      return $(this).attr('row-id') === tabActiveId;
    })
      .addClass('is-selected');

    // And set window title accordingly ..
    document.title = $li.find('>a').first().text();
  }
  else
  {
    document.title = 'Peazy';
  }

  // Current active tab.
  return $li;
};

/**
 * Activate a tab if it already exists.
 *
 * @param id The ID of the tab to activate.
 *
 * @return The current active tab.
 */
export const activateTabIfExists = (id: string) =>
{
  const existingTab = mainTabs.tryTrigger(id);

  if (existingTab.$li.length) updateActiveStates(existingTab.$li);

  return existingTab;
};

/**
 * Load a project.
 *
 * @param args An object providing either a project ID or a project number.
 *
 * @return Whether the project was found.
 */
export const loadProject = async (args: ProjectId): Promise<boolean> =>
{
  // If an ID was passed, check if tab already exists, if so, activate it and bail.
  if (!window.api.core.isEmpty(args.project_id))
  {
    const existingTab = activateTabIfExists(`project-${args.project_id}`);
    if (existingTab.$li.length) return existingTab.promise;
  }
  // If no ID and no project number was passed, bail anyway.
  else if (window.api.core.isEmpty(args.project_number)) return true;

  // Fetch project from the database.
  const project = await window.api.project.getProject(args);

  // Project not found.
  if (project === null) return false;

  // Check once again if tab already exists, if so, activate it and bail.
  const existingTab = activateTabIfExists(`project-${project.project_id}`);
  if (existingTab.$li.length) return existingTab.promise;

  // Initiate project tab.
  let tabProject: projectTab;

  // Create new tab.
  const { $li } = mainTabs.addTab({
    id: null, // the projectTab instance will set the ID, text and title for this tab
    template: 'tmpl-li-main-tab',
    callback: ($div, $li) => tabProject = new projectTab($div, $li, project),
    onclick: $li =>
    {
      html.loading();
      return ($li.hasClass('is-active') ? tabProject.init() : tabProject.onactivate())
        // Project tabs are hierarchical so the tab itself will trigger to update active states.
        .finally(() => (/* updateActiveStates($li), */html.loading(false)));
    },
    onmiddleclick: $li => $li.find('>a.close-btn').first().trigger('click'),
    oncontextmenu: () =>
    {
      return window.api.hooks.applyFilters('contextmenu_project_tab',
        [
          contextMenu.openProjectFolder(tabProject.project),
          contextMenu.copyProjectPath(tabProject.project),
        ],
        tabProject.project);
    },
    classes: ['li-project-tab'],
  });

  // Configure the "close" button.
  $li.find('>a.close-btn').on('click', () =>
  {
    tabProject.dispose();
    tabProject = null;

    mainTabs.removeTab($li);

    // Collect garbage.
    window.gc();
    window.api.gc();

    // Make sure the active states are up-to-date.
    updateActiveStates();
  });

  // All good.
  return tabProject.init();
};

/**
 * Get html for a project tree row.
 *
 * @param project The project.
 */
const projectRow = (project: Project) =>
{
  const project_number = window.api.hooks.applyFilters('project_project_number', project.project_number, project);
  const install_number = window.api.hooks.applyFilters('project_install_number', project.install_number, project);

  const isChild = window.api.hooks.applyFilters('project_is_child', !window.api.core.isEmpty(install_number) && install_number !== project_number, project);

  // Table cells definition for a project browser row.
  // FILTER, BUT THINK ABOUT THEAD TOO !!
  const $tr = TableList.buildRow([
    {
      template: 'tmpl-td-project-date',
      text: new DateTime(project.date_start).getDate(),
    },
    {
      template: 'tmpl-td-project-status',
      text: window.api.hooks.applyFilters('project_status_id', project.status_id, project),
      title: window.api.hooks.applyFilters('project_status_id_title', project.status_name, project),
    },
    {
      template: 'tmpl-td-install-number',
      text: isChild ? install_number : null,
      title: window.api.hooks.applyFilters('project_install_number_title', project.install_id ? `${project.install_description}  •  ${project.relation_name}` : null, project),
      onclick: () =>
      {
        html.loading();
        return loadProject({ project_number: window.api.hooks.applyFilters('project_project_number', install_number) })
          .then(found => found ? (stopBrowsing(), null) : null) // if found, still return `null` / don't (de)activate any rows / let the project tab handle this
          .finally(() => html.loading(false));
      },
      oncontextmenu: () =>
      {
        return window.api.hooks.applyFilters('contextmenu_project_item_browser',
          [
            contextMenu.openProjectFolder({ project_number: project.install_number }),
            contextMenu.copyProjectPath({ project_number: project.install_number }),
          ],
          { project_number: project.install_number });
      },
    },
    {
      template: 'tmpl-td-project-number',
      text: project_number,
      title: window.api.hooks.applyFilters('project_project_number_title', `${project.project_description}  •  ${project.relation_name}`, project),
      onclick: () =>
      {
        html.loading();
        return loadProject(project)
          .then(found => found ? (stopBrowsing(), /* true*/ null) : null) // if found, still return `null` / don't (de)activate any rows / let the project tab handle this
          .finally(() => html.loading(false));
      },
      oncontextmenu: () =>
      {
        return window.api.hooks.applyFilters('contextmenu_project_item_browser',
          [
            contextMenu.openProjectFolder(project),
            contextMenu.copyProjectPath(project),
          ],
          project);
      },
    },
    {
      template: 'tmpl-td-project-description',
      text: window.api.hooks.applyFilters('project_project_description', project.project_description, project),
      title: window.api.hooks.applyFilters('project_project_description_title', `${project.project_description}  •  ${project.relation_name}`, project),
      classes: ['is-narrow'], // not `is-narrow` by default but in this case not the last column, so set it here
    },
    {
      template: 'tmpl-td-project-customer',
      text: window.api.hooks.applyFilters('project_relation_name', project.relation_name, project),
      title: window.api.hooks.applyFilters('project_relation_name_title', `${project.relation_name}`, project),
      onclick: () => null,
    },
  ])
    // Add an ID to the project row to target it when updating active tab.
    .attr('row-id', `project-${project.project_id}`)
    // If is a child of an install number, then add class attribute for selective styling.
    .addClass(isChild ? 'has-install' : null);

  // Set the overall progress indicator (DRY!!).
  $tr
    .find('>th.project-number')
    .prepend($(document.createElement('div')).addClass('progress-line')
      .css('width', (() =>
      {
        const
          timeStart = (new Date(project.date_start)).getTime(),
          timeFinish = (new Date(project.date_finish)).getTime();

        const
          timelineSpan = Math.max(0, timeFinish - timeStart),
          progress = timelineSpan !== 0 ? Math.max(0, Date.now() - timeStart) / timelineSpan * 100 : 0;

        return `${Math.min(100, progress)}%`;
      })()));

  return $tr;
};

/**
 * Performs a deepsearch.
 *
 * @param queryStr The raw search query.
 *
 * @ignore string1 !anti1 14.5 15,4 0,text ^regex1 !^antireg1
 */
const deepsearch = (queryStr: string) =>
{
  // Only show the deepsearch table section.
  projectsTable.$table.find('>tbody').hide();
  projectsTable.tbody(2).empty().show();

  // Divide search query into regexes and strings to force regexes
  // to be handled by the application instead of the database request.
  const [regexArr, stringArr] = window.api.core.partitionArr(Search.flatten(queryStr), queryItem => /^!?\^/u.test(queryItem));

  // Extract strings with decimal symbols and force them to be handled by the application
  // instead of the database request to allow any related filters to work as expected.
  // eslint-disable-next-line prefer-const
  let [searchedByApp, searchedByDatabase] = window.api.core.partitionArr(stringArr, stringItem => /[.,](\d)/u.test(stringItem));
  searchedByApp = searchedByApp.concat(regexArr);

  // Query database with search strings and filter returned rows by the regex array.
  let matches = 0;
  return window.api.project.getProjects({ search_for: searchedByDatabase, orderBy: 'DESC' }, project =>
  {
    if (matches <= window.api.project.maxSelect
      &&
      // Test returned projects against the regex array.
      Search.isMatch([
        window.api.hooks.applyFilters('project_project_number', project.project_number, project),
        window.api.hooks.applyFilters('project_project_description', project.project_description, project),
        window.api.hooks.applyFilters('project_relation_name', project.relation_name, project),
      ],
      searchedByApp))
    {
      projectsTable.tbody(2).append(projectRow(project));

      matches++;
    }
  })
    // Make sure table header sort indicator is up-to-date.
    .then(rowCount => (projectsTable.$table.find('th')
      .removeClass(['is-sorted-asc', 'is-sorted-desc'])
      .filter('.project-date').addClass('is-sorted-desc'), rowCount))
    // Make sure the active states are up-to-date.
    .then(rowCount => (updateActiveStates(), rowCount))
    // Make sure search is up-to-date.
    .then(rowCount => ($('#search-projects').trigger('input'), rowCount));
};

const exitDeepsearch = () =>
{
  projectsTable.$table.find('>tbody').hide();
  projectsTable.tbody(2).empty();
  projectsTable.tbody(0).show();
  projectsTable.tbody(1).show();
};

/**
 * Bind `projectSearch` to search events on the project.
 */
($('#search-projects') as JQuery<HTMLInputElement>)
  .attr('title', 'Enter keyword(s) to search for (and hit Enter to search deep). [Ctrl+Shift+F]')
  .on({
    input: function ()
    {
      if (this.value === '') exitDeepsearch();
      projectSearch.search(this.value);
    },
    keyup: function (e)
    {
      if (e.key === 'Enter')
      {
        html.loading();
        loadProject({ project_number: this.value })
          .then(async (found) =>
          {
            if (!found)
            {
            // Perform a deepsearch.
              await deepsearch(this.value); return false;
            }
            else
            {
            // Clear search and exit browsing state.
              this.value = ''; projectSearch.search('');
              stopBrowsing(); return true;
            }
          })
          .finally(() => html.loading(false));
      }
    },
  });

/**
 * Fetch projects from database to fill the projects table.
 */
const fetchProjectBrowser = async () =>
{
  html.loading();

  projectsTable.tbody(1).empty();
  exitDeepsearch();

  await window.api.project.getProjects({ orderBy: 'DESC' }, project =>
  {
    projectsTable.tbody(1).append(projectRow(project));
  })
    .finally(() => html.loading(false));

  // Make sure table header sort indicator is up-to-date.
  projectsTable.$table.find('th')
    .removeClass(['is-sorted-asc', 'is-sorted-desc'])
    .filter('.project-date').addClass('is-sorted-desc');

  // Make sure the active states are up-to-date.
  updateActiveStates();

  // Make sure search is up-to-date and focussed.
  $('#search-projects')
    .trigger('input')
    .trigger('focus');
};

// Initial fetch.
fetchProjectBrowser();

/**
 * Activate browsing state on sidebar actions.
 */
sidebarTabs.$ul.on('mouseup', () =>
{
  $(document.body).addClass('browsing');
});
$('#sidebar input[type=search]').on('focus', () =>
{
  $(document.body).addClass('browsing');
});

/**
 * Toggle browsing state on key input.
 */
document.addEventListener('keydown', e =>
{
  if (e.ctrlKey && e.shiftKey && e.key === 'F')
  {
    $('#sidebar input[type=search]:visible').first().trigger('focus');
  }
  else if (e.ctrlKey && e.key === 'f')
  {
    stopBrowsing();

    mainTabs.activeTab.$div.find('input[type=search]:visible').last().trigger('focus');
  }
  else if (e.key === 'Escape')
  {
    const $inputSearch = $('#sidebar input[type=search]:visible').first();

    if (!$inputSearch.is(':focus') || $inputSearch.val() === '') stopBrowsing();
  }
  else if (e.key === 'F5')
  {
    $(document.body).hasClass('browsing') ? fetchProjectBrowser() : mainTabs.tryTriggerActive();
  }
});