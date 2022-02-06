interface tableCellItem
{
  /**
   * The template to use.
   */
  template: string,
  /**
   * Text to display in the menu item.
   */
  text?: string,
  /**
   * Html to display in the menu item.
   */
  html?: string,
  /**
   * A title text to display on hover.
   */
  title?: string,
  /**
   * A function to call on click. If set an <a/> element is created.
   */
  onclick?: ($td: JQuery<HTMLTableCellElement>, e: JQuery.ClickEvent<HTMLAnchorElement, undefined, HTMLAnchorElement, HTMLAnchorElement>) => void,
  /**
   * A function to call on double click.
   */
  ondblclick?: ($td: JQuery<HTMLTableCellElement>, e: JQueryEventObject) => void,
  /**
   * A function to call on contextmenu.
   */
  oncontextmenu?: ($td: JQuery<HTMLTableCellElement>, e: JQueryEventObject) => void,
  /**
   * A function to call on middleclick.
   */
  onmiddleclick?: ($td: JQuery<HTMLTableCellElement>, e: JQueryEventObject) => void,
  /**
   * A function to call on dragstart.
   */
  ondragstart?: ($td: JQuery<HTMLTableCellElement>, e: DragEvent) => void,
  /**
   * Additional classes.
   */
  classes?: string[],
}