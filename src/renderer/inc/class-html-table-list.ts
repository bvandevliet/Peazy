import * as html from './functions-html.js';

/**
 * A wrapper class to handle html for table lists.
 */
export default class TableList
{
  /**
   * The html `table` element.
   * This is the element you want to add to the DOM.
   */
  readonly $table: JQuery<HTMLTableElement>;

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
    this.$table.find('>tbody').empty();
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

    return $tbody as JQuery<HTMLTableSectionElement>;
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
      const $td = (column.template ? $(html.getTemplateClone(column.template) as HTMLTableCellElement) : $(document.createElement('td')))
        .addClass(column.classes);

      // JQuery<HTMLAnchorElement> | typeof $td
      let $a: JQuery<HTMLElement> = $td;

      if (typeof column.onclick === 'function')
      {
        $a = $(document.createElement('a'))
          .on('click', e =>
          {
            e.preventDefault();

            column.onclick($tr, $td, e);
          })
          .appendTo($td);
      }

      $a
        .text(column.text)
        .html(column.html)
        .attr('title', column.title);

      if (typeof column.ondblclick === 'function')
      {
        $a.on('dblclick', e =>
        {
          e.preventDefault();

          column.ondblclick($tr, $td, e);
        });
      }

      if (typeof column.oncontextmenu === 'function')
      {
        $a.on('contextmenu', e =>
        {
          e.preventDefault();

          column.oncontextmenu($tr, $td, e);
        });
      }

      if (typeof column.onmiddleclick === 'function')
      {
        $a.on('mousedown', e =>
        {
          e.preventDefault();

          if (e.button === 1) column.onmiddleclick($tr, $td, e);
        });
      }

      if (typeof column.ondragstart === 'function')
      {
        $a
          .attr('draggable', 'true')
          .on('dragstart', e =>
          {
            e.preventDefault();

            column.ondragstart($tr, $td, e);
          });
      }

      if (typeof column.callback === 'function')
      {
        column.callback($td);
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
    const $tr = TableList.buildRow(columns);

    this.tbody(tbodyIndex).prepend($tr);

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
    const $tr = TableList.buildRow(columns);

    this.tbody(tbodyIndex).append($tr);

    return $tr;
  }
}