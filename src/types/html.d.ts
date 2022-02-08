interface tableCellItem
{
  /**
   * The `th` or `td` template to use.
   */
  template: string;
  /**
   * Text to display in the cell.
   */
  text?: string;
  /**
   * Html to display in the cell, overwriting `text` if it's set.
   */
  html?: string;
  /**
   * Title to display on hover.
   */
  title?: string;
  /**
   * Called on click. If set an <a/> element is created.
   */
  onclick?: ($td?: JQuery<HTMLTableCellElement>, e?: JQuery.ClickEvent<HTMLAnchorElement, undefined, HTMLAnchorElement, HTMLAnchorElement>) => void;
  /**
   * Called on double click.
   */
  ondblclick?: ($td?: JQuery<HTMLTableCellElement>, e?: JQuery.DoubleClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void;
  /**
   * Called on contextmenu.
   */
  oncontextmenu?: ($td?: JQuery<HTMLTableCellElement>, e?: JQuery.ContextMenuEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void;
  /**
   * Called on middleclick.
   */
  onmiddleclick?: ($td?: JQuery<HTMLTableCellElement>, e?: JQuery.MouseDownEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void;
  /**
   * Called on dragstart.
   */
  ondragstart?: ($td?: JQuery<HTMLTableCellElement>, e?: JQuery.DragStartEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void;
  /**
   * Additional classes.
   */
  classes?: string[];
}

interface tabItem
{
  /**
   * A unique ID for this tab for within a `Tabs` wrapper.
   */
  id: string;
  /**
   * The `li` template to use.
   */
  template?: string;
  /**
   * Callback function intended for rendering the page content before it is visible.
   */
  callback: ($div: JQuery<HTMLDivElement>) => void;
  /**
   * Text to display in the tab.
   */
  text?: string;
  /**
   * Html to display in the tab, overwriting `text` if it's set.
   */
  html?: string;
  /**
   * Title to display on hover.
   */
  title?: string;
  /**
   * Called on click. If set an <a/> element is created.
   */
  onclick?: ($li?: JQuery<HTMLLIElement>, $div?: JQuery<HTMLDivElement>, e?: JQuery.ClickEvent<HTMLAnchorElement, undefined, HTMLAnchorElement, HTMLAnchorElement>) => void;
  /**
   * Called on double click.
   */
  ondblclick?: ($li?: JQuery<HTMLLIElement>, $div?: JQuery<HTMLDivElement>, e?: JQuery.DoubleClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void;
  /**
   * Called on contextmenu.
   */
  oncontextmenu?: ($li?: JQuery<HTMLLIElement>, $div?: JQuery<HTMLDivElement>, e?: JQuery.ContextMenuEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void;
  /**
   * Called on middleclick.
   */
  onmiddleclick?: ($li?: JQuery<HTMLLIElement>, $div?: JQuery<HTMLDivElement>, e?: JQuery.MouseDownEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void;
  /**
   * Called on dragstart.
   */
  ondragstart?: ($li?: JQuery<HTMLLIElement>, $div?: JQuery<HTMLDivElement>, e?: JQuery.DragStartEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => void;
  /**
   * Additional classes for the tab.
   */
  classes?: string[];
}

interface tabPage
{
  /**
   * Triggered on activating the tab.
   */
  onactivate: tabItem['onclick'];
  /**
   * Triggered when the tab is closing.
   */
  dispose: () => void;
}