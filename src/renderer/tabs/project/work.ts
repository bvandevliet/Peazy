import DateTime from '../../inc/class-datetime.js';
import TableList from '../../inc/class-html-table-list.js';
import Search from '../../inc/class-search.js';
import * as html from '../../inc/functions-html.js';
import * as contextMenu from '../../inc/templates-contextmenu.js';

/**
 * A wrapper class to handle html for tabs.
 */
export default class workTab implements tabPage
{
  readonly $div;
  readonly $li;

  private _project: Project = null;

  private _workHours;
  private _workSearch;

  /**
   * Current active project of this tab.
   */
  get project ()
  {
    return this._project;
  }

  /**
   *
   * @param $div The tab page `div` element.
   * @param $li  The tab `li` element.
   */
  constructor ($div: JQuery<HTMLDivElement>, $li: JQuery<HTMLLIElement>)
  {
    // Define class globals.
    this.$div = $div;
    this.$li = $li;

    // Load the tab page template.
    this.$div.append(html.getTemplateClone('tmpl-tab-page-project-hours'));

    // Create a `TableList` wrapper for the table.
    this._workHours = new TableList(this.$div.find('table.table-hours') as JQuery<HTMLTableElement>);

    // Initiate the search handler.
    this._workSearch = new Search(this._workHours.$table, '>tbody>tr', tr =>
      $(tr).find('>*:not(.ignore-search)').toArray().map(td => td.textContent));

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisClass = this;
    (this.$div.find('input.search-hours') as JQuery<HTMLInputElement>).on('input', function ()
    {
      thisClass._workSearch.search(this.value);
    });
  }

  /**
   * Prints html.
   *
   * @param project The project.
   */
  private loadProject (project: Project)
  {
    // Set the current project for this tab.
    this._project = project;

    // Print.
    this._workHours.empty();
    return window.api.project.getWorkHours(this._project, hours =>
    {
      // FILTER, BUT THINK ABOUT THEAD TOO !!
      this._workHours.appendItem([
        {
          text: `${hours.resource_first_name} ${hours.resource_name}`,
          onclick: () => new Promise(resolve => resolve(false)),
          classes: ['min-width'],
        },
        {
          text: hours.worktype_code,
          classes: ['min-width'],
        },
        {
          text: hours.worktype_name,
          classes: ['min-width'],
        },
        {
          text: hours.amount.toFixed(2),
          classes: ['min-width', 'is-number'],
        },
        {
          text: new DateTime(hours.date_start).getDate(),
          classes: ['min-width', 'is-number'],
        },
        {
          text: new DateTime(hours.date_end).getDate(),
          classes: ['min-width', 'is-number'],
        },
        {
          // empty cell to fill remaining space ..
        },
      ]);
    });
  }

  init (project: Project)
  {
    return this.loadProject(project).then(() => true);
  }

  onactivate (project: Project): Promise<boolean>
  {
    return this._project && project.project_id === this._project.project_id
      ? new Promise(resolve => resolve(true))
      : this.loadProject(project).then(() => true);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispose () {}
}