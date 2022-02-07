interface tableCellItem
{
  /**
   * The `th` or `td` template to use.
   */
  template: string,
  /**
   * Text to display in the cell.
   */
  text?: string,
  /**
   * Html to display in the cell, overwriting `text` if it's set.
   */
  html?: string,
  /**
   * Title to display on hover.
   */
  title?: string,
  /**
   * Called on click. If set an <a/> element is created.
   */
  onclick?: ($td: JQuery<HTMLTableCellElement>, e: JQuery.ClickEvent<HTMLAnchorElement, undefined, HTMLAnchorElement, HTMLAnchorElement>) => void,
  /**
   * Called on double click.
   */
  ondblclick?: ($td: JQuery<HTMLTableCellElement>, e: JQuery.DoubleClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void,
  /**
   * Called on contextmenu.
   */
  oncontextmenu?: ($td: JQuery<HTMLTableCellElement>, e: JQuery.ContextMenuEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void,
  /**
   * Called on middleclick.
   */
  onmiddleclick?: ($td: JQuery<HTMLTableCellElement>, e: JQuery.MouseDownEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void,
  /**
   * Called on dragstart.
   */
  ondragstart?: ($td: JQuery<HTMLTableCellElement>, e: JQuery.DragStartEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void,
  /**
   * Additional classes.
   */
  classes?: string[],
}