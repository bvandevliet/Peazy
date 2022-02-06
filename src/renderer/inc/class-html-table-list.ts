import * as html from './functions-html.js';

/**
 * A wrapper class to handle html for table lists.
 */
export default class TableList
{
  /**
   * The html table element.
   */
  $table: JQuery<HTMLTableElement>;

  /**
   * The amount of `tbody` elements.
   */
  get tbodyCount ()
  {
    return this.$table.find('>tbody').length;
  }

  /**
   *
   * @param table Initiate a `TableList` instance for a given table element.
   */
  constructor (table: HTMLTableElement | JQuery<HTMLTableElement>)
  {
    this.$table = $(table);
  }

  /**
   * Remove all `tbody` elements.
   */
  empty ()
  {
    this.$table.find('>tbody').remove();
  }

  /**
   * Get a `tbody` element by index.
   *
   * @param {number} tbodyIndex The index of the tbody element to retrieve.
   */
  tbody (tbodyIndex = 0)
  {
    let $tbody = this.$table.find('>tbody').eq(tbodyIndex);

    if (!$tbody.length)
    {
      $tbody = $(document.createElement('tbody'));
      this.$table.append($tbody);
    }

    return $tbody;
  }

  /**
   * Build a row.
   *
   *@param columns An array of `tableRowColumns` objects.
   */
  static buildRow (columns: tableCellItem[])
  {
    const $tr = $(document.createElement('tr'));

    columns.forEach(column =>
    {
      const $td = ($(html.getTemplateClone(column.template)) as JQuery<HTMLTableCellElement>)
        .addClass(column.classes);

      let $a: JQuery<HTMLAnchorElement> | typeof $td = $td;

      if (typeof column.onclick === 'function')
      {
        $a = $(document.createElement('a'))
          .on('click', e => column.onclick($td, e));

        $td.append($a);
      }

      ($a
        .text(column.text) as JQuery<HTMLElement>)
        .html(column.html)
        .attr('title', column.title);

      if (typeof column.ondblclick === 'function')
      {
        $a.on('dblclick', e => column.ondblclick($td, e));
      }

      if (typeof column.oncontextmenu === 'function')
      {
        $a.on('contextmenu', e => column.oncontextmenu($td, e));
      }

      if (typeof column.onmiddleclick === 'function')
      {
        $a.on('mousedown', e =>
        {
          e.preventDefault();

          if (e.which === 2 || e.button === 4) column.onmiddleclick($td, e);
        });
      }

      if (typeof column.ondragstart === 'function')
      {
        $a
          .on('dragstart', e => column.ondragstart($td, e as unknown as DragEvent))
          .attr('draggable', 'true');
      }

      $tr.append($td);
    });

    return $tr;
  }

  /**
   * Prepend items to a `tbody` element.
   *
   * @param columns    An array of `tableRowColumns` objects.
   * @param tbodyIndex The index of the `tbody` element to apply to.
   */
  prependItem (columns: tableCellItem[], tbodyIndex = 0)
  {
    let $tbody = this.$table.find('>tbody').eq(tbodyIndex) as JQuery<HTMLTableSectionElement>;

    if (!$tbody.length)
    {
      $tbody = $(document.createElement('tbody'));

      this.$table.append($tbody);
    }

    const $tr = TableList.buildRow(columns);

    $tbody.prepend($tr);

    return $tr;
  }

  /**
   * Append items to a `tbody` element.
   *
   * @param columns    An array of `tableRowColumns` objects.
   * @param tbodyIndex The index of the `tbody` element to apply to.
   */
  appendItem (columns: tableCellItem[], tbodyIndex = 0)
  {
    let $tbody = this.$table.find('>tbody').eq(tbodyIndex) as JQuery<HTMLTableSectionElement>;

    if (!$tbody.length)
    {
      $tbody = $(document.createElement('tbody'));

      this.$table.append($tbody);
    }

    const $tr = TableList.buildRow(columns);

    $tbody.append($tr);

    return $tr;
  }
}