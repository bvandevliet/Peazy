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

/**
 * A filter example.
 */
window.addEventListener('DOMContentLoaded', () =>
{
  window.api.core.addFilter('test', value => `${value}+append1`);
  window.api.core.addFilter('test', value => `${value}+append2`);

  console.log(window.api.core.applyFilters('test', 'original'));
});