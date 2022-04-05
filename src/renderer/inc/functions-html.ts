/**
 * Copy a string to the clipboard.
 *
 * @param text The text to copy.
 */
export const copyText = (text: string) =>
{
  navigator.clipboard.writeText(text);
};

/**
 * Show/hide floating loader.
 *
 * @param enable
 */
export const loading = (enable = true) =>
{
  enable ? $('#loader').show() : $('#loader').hide();
};

/**
 * Html template reference cache.
 */
const templateReferences: Record<string, DocumentFragment> = {};

/**
 * Get a html template node by ID.
 *
 * @param id The ID of the template to get.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
 */
export const getTemplateClone = (id: string) =>
{
  if (undefined === templateReferences[id])
  {
    templateReferences[id] = (document.getElementById(id) as HTMLTemplateElement).content;
  }

  return (templateReferences[id]?.firstElementChild.cloneNode(true) as HTMLElement);
};

/**
 * Sort elements alphabetically and numerically.
 *
 * @param elemSet The set of elements to sort.
 * @param sortBy  Callback function to return a value to sort by.
 * @param orderBy Sort order. Default is `ASC`.
 */
export const sortElement =
(
  elemSet: any,
  sortBy: (curElem: HTMLElement) => string | number,
  orderBy: Order = 'ASC',
) =>
{
  const doSort = (a: HTMLElement, b: HTMLElement) =>
  {
    const textA = sortBy(a).toString().trim();
    const textB = sortBy(b).toString().trim();

    return textA.localeCompare(textB, undefined, { numeric: true, sensitivity: 'base' });
  };

  $(elemSet).toArray()
    .sort((a, b) => orderBy === 'DESC' ? doSort(b, a) : doSort(a, b))
    .forEach(curElem => $(curElem).parent().append(curElem));
};

/**
 * Set event handlers to sortable table header and footer columns.
 *
 * @param table The table element to process.
 */
export const makeTableSortable = (table: HTMLTableElement | JQuery<HTMLTableElement>) =>
{
  ($(table).find('thead th.is-sortable, tfoot th.is-sortable') as JQuery<HTMLTableCellElement>).on('click', function ()
  {
    const $th = $(this);

    const i = $th.index();
    const $table = $th.parents('table').first();

    // Get the `th` elements in both table header and footer.
    const $thSet = $table.find(`>thead>tr>th:nth-child(${i + 1}), >tfoot>tr>th:nth-child(${i + 1})`);

    const order = $thSet.hasClass('is-sorted-asc') ? 'desc' : 'asc';

    $thSet.add($thSet.siblings()).removeClass(['is-sorted-asc', 'is-sorted-desc']);
    $thSet.addClass(`is-sorted-${order}`);

    sortElement($table.find('>tbody>tr'),
      elem => $(elem).find('th, td').eq(i).text(),
      order.toUpperCase() as Order);
  });
};