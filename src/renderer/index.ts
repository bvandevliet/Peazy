import DateTime from './inc/class-datetime.js';
import TableList from './inc/class-html-table-list.js';
import Search from './inc/class-search.js';
import Tabs from './inc/class-tabs.js';
import projectTab from './tabs/project/_index.js';
import * as html from './inc/functions-html.js';

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
  },
  {
    id: 'browser-customers',
    template: 'tmpl-li-customers',
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
document.addEventListener('keyup', e =>
{
  if (e.ctrlKey && e.shiftKey && e.key === 'F')
  {
    $('#sidebar input[type=search]:visible').first().trigger('focus');
  }
  else if (e.key === 'Escape')
  {
    stopBrowsing();
  }
});

/**
 * The project page tabs.
 */
const mainTabs = new Tabs();

/**
 * Append main tabs to the main window.
 */
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
 * Update active rows in the browser according to current active tab.
 *
 * @param id The ID of the tab if already known.
 */
export const updateActiveStates = (id?: string) =>
{
  id = id ?? mainTabs.activeTab[0].attr('tab-id');

  projectsTable.$table.find('tr')
    .removeClass('is-selected')
    .filter(function ()
    {
      return $(this).attr('row-id') === id;
    })
    .addClass('is-selected');
};

/**
 * Activate a tab if it already exists.
 *
 * @param id The ID of the tab.
 *
 * @return The amount of existing tabs. Either `0` or `1`.
 */
export const activateTabIfExists = (id: string) =>
{
  const existingTab = mainTabs.tryTrigger(id)[0];

  if (existingTab.length) updateActiveStates(id);

  return existingTab.length;
};

/**
 * Load a project.
 *
 * @param args An object providing either a project ID or a project number.
 *
 * @return Whether the project was found.
 */
const loadProject = async (args: ProjectId): Promise<boolean> =>
{
  // If an ID was passed, check if tab already exists, if so, activate it and bail.
  if (!window.api.core.isEmpty(args.project_id) && activateTabIfExists(`project-${args.project_id}`)) return true;

  // Fetch project from the database.
  const project = await window.api.project.getProject(args)
    .catch(err =>
    {
      // spawn ERROR dialog message box !!

      throw new Error(err);
    });

  // Project not found.
  if (project === null) return false;

  /**
   * Initiate project tab.
   */
  let tabProject: tabPage;

  // Create new tab.
  const [$li] = mainTabs.addTab({
    id: null, // the projectTab instance will set the ID, text and title for this tab
    template: 'tmpl-li-project-tab',
    callback: ($div, $li) => tabProject = new projectTab($div, $li, project),
    onclick: () =>
    {
      html.loading();
      return tabProject.onactivate()
        .finally(() => html.loading(false));
    },
    onmiddleclick: $li => $li.find('>a.close-btn').first().trigger('click'),
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

    updateActiveStates();
  });

  // All good.
  return tabProject.onactivate().then(() => true);
};

/**
 * Bind `projectSearch` to search events on the project.
 */
($('#search-projects') as JQuery<HTMLInputElement>)
  .on('search', function ()
  {
    projectSearch.search(this.value);
  })
  .on('keyup', function (e)
  {
    switch (e.key)
    {
      case 'Escape':
        // eslint-disable-next-line no-useless-return
        return;

      case 'Enter':
        html.loading();
        loadProject({ project_number: this.value })
          .then(found =>
          {
            if (!found) return null; // deepsearch !!

            // Clear search and exit browsing state.
            this.value = ''; projectSearch.search(''); stopBrowsing();
          })
          .finally(() => html.loading(false));
        break;

      default:
        projectSearch.search(this.value);
        break;
    }
  });

/**
 * Fetch projects from database to fill the projects table.
 */
const fetchProjectBrowser = () =>
{
  html.loading();

  projectsTable.empty();

  window.api.project.getProjects({ orderBy: 'DESC' }, project =>
  {
    const project_number = window.api.core.applyFilters('project_project_number', project.project_number, project);
    const install_number = window.api.core.applyFilters('project_install_number', project.install_number, project);

    const isChild = window.api.core.applyFilters('project_is_child', !window.api.core.isEmpty(install_number) && install_number !== project_number, project);

    projectsTable.appendItem([
      {
        template: 'tmpl-td-project-date',
        text: new DateTime(project.date_created).getDate(),
      },
      {
        template: 'tmpl-td-project-status',
        text: window.api.core.applyFilters('project_status_id', project.status_id, project),
        title: window.api.core.applyFilters('project_status_id_title', project.status_name, project),
      },
      {
        template: 'tmpl-td-install-number',
        text: isChild ? install_number : null,
        title: window.api.core.applyFilters('project_install_number_title', project.install_id ? `${project.install_description}  •  ${project.customer_name}` : null, project),
        onclick: () =>
        {
          html.loading();
          return loadProject({ project_number: install_number })
            .then(found => found ? (stopBrowsing(), false) : false)
            .finally(() => html.loading(false));
        },
      },
      {
        template: 'tmpl-td-project-number',
        text: project_number,
        title: window.api.core.applyFilters('project_project_number_title', `${project.project_description}  •  ${project.customer_name}`, project),
        onclick: () =>
        {
          html.loading();
          return loadProject(project)
            .then(found => found ? (stopBrowsing(), true) : false)
            .finally(() => html.loading(false));
        },
      },
      {
        template: 'tmpl-td-project-description',
        text: window.api.core.applyFilters('project_project_description', project.project_description, project),
        title: window.api.core.applyFilters('project_project_description_title', `${project.project_description}  •  ${project.customer_name}`, project),
      },
      {
        template: 'tmpl-td-project-customer',
        text: project.customer_name,
        title: window.api.core.applyFilters('project_customer_name_title', `${project.customer_name}`, project),
      },
    ])
      // Add an ID to the project row to target it when updating active tab.
      .attr('row-id', `project-${project.project_id}`)
      // If is a child of an install number, then add class attribute for selective styling.
      .addClass(isChild ? 'has-install' : null);
  })
    .finally(() => html.loading(false));
};

// Initial fetch.
fetchProjectBrowser();