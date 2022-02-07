import DateTime from './inc/class-datetime.js';
import TableList from './inc/class-html-table-list.js';
import Tabs from './inc/class-tabs.js';
import Search from './inc/class-search.js';
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
    $(document.body).removeClass('browsing');
    $('#sidebar input[type=search]:focus').first().trigger('blur');
  }
});

/**
 * Activate browsing state on sidebar actions.
 */
$('#sidebar-categories').on('mouseup', () =>
{
  $(document.body).addClass('browsing');
});
$('#sidebar input[type=search]').on('focus', () =>
{
  $(document.body).addClass('browsing');
});

/**
 * Initiate sorting on any already available / non-dynamically generated html tables that support it.
 */
html.makeTableSortable($('table'));

/**
 * Initiate the main tabs.
 */
const mainTabs = new Tabs();

/**
 * Append main tabs to the main window.
 */
$('#main').append(mainTabs.$container);

/**
 * Load a project.
 *
 * @param args An object providing either a project ID or a project number.
 *
 * @return Whether the project was found.
 */
const loadProject = async (args: ProjectId): Promise<boolean> =>
{
  const tabId = 'project-'; // to be appended to later ..

  // If an ID was passed, check if tab already exists, if so, activate it and bail.
  if (!window.api.core.isEmpty(args.project_id))
  {
    const [$li] = mainTabs.tryTrigger(`${tabId}${args.project_id}`);

    if ($li.length > 0) return true;
  }

  // Fetch project from the database.
  const project = await window.api.project.getProject(args)
    .catch(err =>
    {
      // spawn ERROR dialog message box !!

      throw new Error(err);
    });

  // Project not found.
  if (project === null) return false;

  // Create new tab.
  const [$li] = mainTabs.addTab({
    id: `${tabId}${project.project_id}`,
    template: 'tmpl-li-project-tab',
    text: window.api.core.applyFilters('project_project_number', project.project_number, project),
    title: window.api.core.applyFilters('project_project_number_title', `${project.project_description}  •  ${project.customer_name}`, project),
    callback: $div =>
    {
      $div.html('<p>Paragraph..</p>');
    },
  });

  // Configure the "close" button.
  $li.find('>a.close-btn').on('click', () =>
  {
    // dispose relative instances !!

    mainTabs.removeTab($li);
  });

  // All good.
  return true;
};

/**
 * Create a `TableList` wrapper for the projects-table html element.
 */
const projectBrowser = new TableList($('#projects-table'));

/**
 * Initiate the search handler for the projects-table.
 */
const projectSearch = new Search(projectBrowser.$table, '>tbody>tr', tr => $(tr).find('>th, >td').toArray().map(td => td.textContent));

/**
 * Bind `projectSearch` to search events on the project-table.
 */
($('#project-search') as JQuery<HTMLInputElement>)
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

            // Clear search and deactivate browsing state.
            this.value = ''; projectSearch.search('');
            $(document.body).removeClass('browsing');
          })
          .finally(() => html.loading(false));
        break;

      default:
        projectSearch.search(this.value);
        break;
    }
  });

/**
 * Fetch projects from database to fill the projects-table.
 */
const fetchProjectBrowser = () =>
{
  html.loading();

  projectBrowser.empty();

  window.api.project.getProjects(
    {
      single: false,
      orderBy: 'DESC',
    },
    project =>
    {
      projectBrowser.appendItem([
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
          text: window.api.core.applyFilters('project_install_number', project.install_number, project),
          title: window.api.core.applyFilters('project_install_number_title', project.install_id ? `${project.install_description}  •  ${project.customer_name}` : null, project),
          onclick: () =>
          {
            html.loading();
            loadProject({ project_number: window.api.core.applyFilters('project_install_number', project.install_number, project) })
              .finally(() => html.loading(false));
          },
        },
        {
          template: 'tmpl-td-project-description',
          text: project.install_description,
          classes: ['is-hidden'], // hidden column just to enhance search functionality ..
        },
        {
          template: 'tmpl-td-project-number',
          text: window.api.core.applyFilters('project_project_number', project.project_number, project),
          title: window.api.core.applyFilters('project_project_number_title', `${project.project_description}  •  ${project.customer_name}`, project),
          onclick: () =>
          {
            html.loading();
            loadProject(project)
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
      ]);
    },
  )
    .finally(() => html.loading(false));
};
fetchProjectBrowser();