import DateTime from './inc/class-datetime.js';
import TableList from './inc/class-html-table-list.js';
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
 * Handle sortable table columns.
 */
const sortTable: JQuery.TypeEventHandler<HTMLTableCellElement, undefined, HTMLElement, HTMLElement, string> = function ()
{
  const $th = $(this);

  const i = $th.index();
  const $table = $th.parents('table').first();

  // Get the `th` elements in both table header and footer.
  const $thSet = $table.find(`>thead>tr>th:nth-child(${i + 1}), >tfoot>tr>th:nth-child(${i + 1})`);

  const order = $thSet.hasClass('is-sorted-asc') ? 'desc' : 'asc';

  $thSet.add($thSet.siblings()).removeClass(['is-sorted-asc', 'is-sorted-desc']);
  $thSet.addClass(`is-sorted-${order}`);

  html.sortElement($table.find('>tbody>tr'),
    elem => $(elem).find('th, td').eq(i).text(),
    order === 'desc' ? Order.DESC : Order.ASC);
};

/**
 * Initiate sorting on already available / non-dynamically generated html tables that support it.
 */
($('thead th.is-sortable, tfoot th.is-sortable') as JQuery<HTMLTableCellElement>).on('click', sortTable);

const projectBrowser = new TableList($('#projects-table'));

const fetchProjectBrowser = () =>
{
  projectBrowser.empty();

  window.api.project.getProjects(
    {
      single: false,
      orderBy: Order.DESC,
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
          onclick: () => console.log('onclick install-number'),
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
          onclick: () => console.log('onclick project-number'),
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
  );
};
fetchProjectBrowser();