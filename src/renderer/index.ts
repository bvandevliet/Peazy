import * as html from './inc/functions-html.js';

/**
 * Make sure to always copy plain text without styling.
 */
document.addEventListener('copy', e =>
{
  e.preventDefault();
  e.clipboardData.setData('text/plain', document.getSelection().toString());
});

/**
 * Toggle browsing state on key input.
 */
document.addEventListener('keyup', e =>
{
  if (e.ctrlKey && e.shiftKey && e.key === 'F')
  {
    $(document.body).addClass('browsing');
    // setTimeout(() => { $project_search[0].focus(); });
  }
  else if (e.key === 'Escape')
  {
    $(document.body).removeClass('browsing');
    // setTimeout(() => { $project_search[0].blur(); });
  }
});

/**
 * Toggle browsing state on sidebar mouse input.
 */
$('#sidebar').on('mouseup', function (e)
{
  const $targetStack = $(e.target).add($(e.target).parents());

  // Ignore the event if not intended.
  if ($targetStack.hasClass('ignore-click')) return;

  // Remove browsing state for links that open a main tab.
  if ($targetStack.hasClass('opens-main-tab'))
  {
    $(document.body).removeClass('browsing');
  }
  // Taking care of scrollbar.
  else if (e.clientX < this.clientWidth - 18)
  {
    $(document.body).addClass('browsing');
  }
});

$('thead th.is-sortable, tfoot th.is-sortable').on('click', function ()
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
    order === 'desc' ? html.Order.DESC : html.Order.ASC);
});

/**
 * A filter example.
 */
window.addEventListener('DOMContentLoaded', () =>
{
  window.api.core.addFilter('test', value => `${value}+append1`);
  window.api.core.addFilter('test', value => `${value}+append2`);

  console.log(window.api.core.applyFilters('test', 'original'));
});