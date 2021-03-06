import FilePreview from '../../inc/class-file-preview.js';
import DateTime from '../../inc/class-datetime.js';
import TableList from '../../inc/class-html-table-list.js';
import Search from '../../inc/class-search.js';
import * as html from '../../inc/functions-html.js';
import * as contextMenu from '../../inc/templates-contextmenu.js';

/**
 * A wrapper class to handle html for tabs.
 */
export default class docsTab implements tabPage
{
  readonly $div;
  readonly $li;

  private _project: Project = null;

  private _docsTable;
  private _docsSearch;

  private _docPreview;

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
    this.$div.append(html.getTemplateClone('tmpl-tab-page-project-docs'));

    // Create a `TableList` wrapper for the table.
    this._docsTable = new TableList(this.$div.find('table.table-docs') as JQuery<HTMLTableElement>);

    // Initiate the search handler.
    this._docsSearch = new Search(this._docsTable.$table, '>tbody>tr', tr =>
      $(tr).find('>*:not(.ignore-search)').toArray().map(td => td.textContent));

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisClass = this;
    (this.$div.find('input.search-docs') as JQuery<HTMLInputElement>).on('input', function ()
    {
      thisClass._docsSearch.search(this.value);
    });

    // Initiate File Preview.
    this._docPreview = new FilePreview(() => this._docsTable.$table.find('>tbody>tr').removeClass('is-selected'));
    this.$div.find('div.project-docs-content').append(this._docPreview.$preview);
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

    // Close the File Preview.
    this._docPreview.close();

    // Print.
    this._docsTable.empty();
    return window.api.project.getAttachedDocuments(this._project, doc =>
    {
      // Skip hidden docs.
      if (doc.is_hidden) return;

      // FILTER, BUT THINK ABOUT THEAD TOO !!
      const $tr = this._docsTable.appendItem([
        {
          html: '<img draggable="false" />',
          classes: ['is-file-icon', 'ignore-search'],
        },
        {
          text: doc.title,
          onclick: () =>
          {
            // html.loading();
            return this._docPreview.preview(doc.path)
              // Always activate.
              .then(() => true);
            // .finally(() => html.loading(false));
          },
          oncontextmenu: () =>
          {
            return [
              contextMenu.openFileNative(doc.path),
            ];
          },
          ondblclick: () => window.api.fs.openNative(doc.path),
          classes: ['reset-color'],
        },
        {
          text: doc.version.toFixed(1),
          classes: ['is-narrow', 'is-number', 'ignore-search'],
        },
        {
          text: new DateTime(doc.date_modified).getDate(),
          classes: ['is-narrow', 'is-number', 'ignore-search'],
        },
      ]);

      // Get the file icon.
      window.api.fs.getFileIcon(doc.path)
        .then(dataUrl => $tr.find('>td.is-file-icon img').first().attr('src', dataUrl));
    })
      // Make sure search is up-to-date.
      .finally(() => this.$div.find('input.search-docs').trigger('input'));
  }

  init (project: Project)
  {
    // Load project.
    return this.loadProject(project)
      // Make sure search is focussed and return `true`.
      .then(() => (setTimeout(() => this.$div.find('input.search-docs').trigger('focus'), 5), true));
  }

  onactivate (project: Project): Promise<boolean>
  {
    return new Promise(resolve =>
      resolve(!this._project || project.project_id !== this._project.project_id))
      // Load when needed.
      .then(load => load ? this.loadProject(project) : null)
      // Make sure search is focussed and return `true`.
      .then(() => (setTimeout(() => this.$div.find('input.search-docs').trigger('focus'), 5), true));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispose () {}
}