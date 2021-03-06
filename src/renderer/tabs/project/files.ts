import FilePreview from '../../inc/class-file-preview.js';
import DateTime from '../../inc/class-datetime.js';
import TableList from '../../inc/class-html-table-list.js';
import Search from '../../inc/class-search.js';
import * as html from '../../inc/functions-html.js';
import * as contextMenu from '../../inc/templates-contextmenu.js';

/**
 * A wrapper class to handle html for tabs.
 */
export default class filesTab implements tabPage
{
  readonly $div;
  readonly $li;

  private _project: Project = null;
  private _projectPaths: ReturnType<Window['api']['project']['getProjectPaths']> = null;

  private _filesTable;
  private _filesSearch;

  private _filePreview;

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
    this.$div.append(html.getTemplateClone('tmpl-tab-page-project-files'));

    // Create a `TableList` wrapper for the table.
    this._filesTable = new TableList(this.$div.find('table.table-files') as JQuery<HTMLTableElement>);

    // Initiate the search handler.
    // * First `tbody` is the root directory and should always be visible.
    // * First `tr` is a directory row so ignore it as its value is added to each file row value.
    this._filesSearch = new Search(this._filesTable.$table, '>tbody:not(:first-child), >tbody>tr:not(:first-child)', elem =>
    {
      const $elem = $(elem);

      // Allow cross-searching directory- and file names.
      return ($elem.is('tbody')
        // Hide whole `tbody` if none of its rows match the search query.
        ? $elem.find('>tr>*:not(.ignore-search)')
        // Allow searching by directory name.
        : $elem.add($elem.prevAll(':first-child')).find('>*:not(.ignore-search)'))
        // Return the strings to search in.
        .toArray().map(td => td.textContent);
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisClass = this;
    (this.$div.find('input.search-files') as JQuery<HTMLInputElement>).on('input', function ()
    {
      thisClass._filesSearch.search(this.value);
    });

    // Initiate File Preview.
    this._filePreview = new FilePreview(() =>
    {
      this._filesTable.$table.find('>tbody>tr').removeClass('is-selected');
      this.$div.find('.column.sidebar').addClass('full-width');
    });
    this.$div.find('div.project-files-content').append(this._filePreview.$preview);
  }

  private buildFolderRow = (dirPath: string, rootPath: string) =>
  {
    const isRoot = dirPath === rootPath;

    const semiBasename = isRoot ? rootPath : dirPath.replace(rootPath, '.');

    const $tr = TableList.buildRow([
      {
        text: semiBasename,
        title: semiBasename,
        oncontextmenu: () => window.api.hooks.applyFilters('contextmenu_folder',
          [
            contextMenu.openFolderNative(dirPath),
            // contextMenu.separator,
            contextMenu.copyPath(dirPath),
          ],
          dirPath,
          isRoot),
        ondblclick: () => window.api.fs.openNative(dirPath),
      },
    ])
      .addClass(isRoot ? null : 'is-folder-row');

    // Span folder row full width.
    $tr.find('>td').first().attr('colspan', '99');

    return $tr;
  };

  private buildFileRow = (fileInfo: ReturnType<Window['api']['fs']['getFileInfo']>) =>
  {
    const basename = window.api.path.basename(fileInfo.fullPath);

    const $tr = TableList.buildRow([
      {
        html: '<img draggable="false" />',
        classes: ['is-file-icon', 'ignore-search'],
      },
      {
        text: basename,
        title: basename,
        onclick: async (_$td, $tr) =>
        {
          // html.loading();

          const activated = $tr.hasClass('is-selected');

          if (!activated)
          {
            // Open File Preview.
            await this._filePreview.preview(fileInfo.fullPath);
            this.$div.find('.column.sidebar').removeClass('full-width');
          }
          else
          {
            // Close File Preview.
            this._filePreview.close();
            this.$div.find('.column.sidebar').addClass('full-width');
          }

          // html.loading(false);

          // Toggle state.
          return !activated;
        },
        oncontextmenu: () => window.api.hooks.applyFilters('contextmenu_file',
          [
            contextMenu.openFileNative(fileInfo.fullPath),
            contextMenu.showInExplorer(fileInfo.fullPath),
            // contextMenu.separator,
            contextMenu.copyPath(fileInfo.fullPath),
          ],
          fileInfo),
        ondblclick: () => window.api.fs.openNative(fileInfo.fullPath),
        ondragstart: () =>
        {
          window.api.fs.startDrag(fileInfo.fullPath);
        },
        classes: ['reset-color'],
      },
      {
        text: `${Math.ceil((fileInfo.size as number) / 1024).toLocaleString()} kB`,
        classes: ['is-narrow', 'is-number', 'ignore-search'],
      },
      {
        text: new DateTime(fileInfo.modified).getTimestamp(),
        classes: ['is-narrow', 'is-number', 'ignore-search'],
      },
    ]);

    // Get the file icon.
    window.api.fs.getFileIcon(fileInfo.fullPath)
      .then(dataUrl => $tr.find('>td.is-file-icon img').first().attr('src', dataUrl));

    return $tr;
  };

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
    this._filePreview.close();
    this.$div.find('.column.sidebar').addClass('full-width');

    // Find the project folder.
    this._projectPaths = window.api.project.getProjectPaths(this._project);

    // Fully remove all `tbody` elements to reinstate the index.
    this._filesTable.$table.find('>tbody').remove();

    // Then print files if project folder exists.
    if (this._projectPaths.projectPaths.length)
    {
      const rootPath = this._projectPaths.projectPaths[0];

      let tbodyIndex = 0;

      /**
       * Recursively read a directory and print its contents.
       *
       * @param dirPath Full path of the parent directory.
       */
      const readdirWalker = (dirPath: string) =>
      {
        if (!window.api.fs.existsSync(dirPath)) return;

        // Print folder row.
        this._filesTable.tbody(tbodyIndex).prepend(this.buildFolderRow(dirPath, rootPath));

        const contents = window.api.fs.readdirSync(dirPath)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
          .map(fileName => window.api.fs.getFileInfo(window.api.path.join(dirPath, fileName)));

        // Divide into files and folders.
        const [fileInfos, dirInfos] = window.api.core.partitionArr(contents, fileInfo => fileInfo.isFile);

        // Loop files first ..
        fileInfos.forEach(fileInfo =>
        {
          if (!new RegExp(window.api.fs.ignoreFiles, 'iu').test(fileInfo.fullPath))
          {
            // Print file row.
            this._filesTable.tbody(tbodyIndex).append(this.buildFileRow(fileInfo));
          }
        });

        // Then read and print sub directories ..
        dirInfos.forEach(dirInfo =>
        {
          // Increment `tbody` index.
          tbodyIndex = this._filesTable.tbodyCount;

          // Just double check as we cannot assume that per definition all non-files are directories.
          if (dirInfo.isDirectory) readdirWalker(dirInfo.fullPath);
        });
      };

      // Initiate the recursive directory read.
      readdirWalker(rootPath);

      // Make sure search is up-to-date.
      this.$div.find('input.search-files').trigger('input');
    }

    else
    {
      // Project folder was not found, offer to create it.
      this._filesTable.appendItem([
        {
          text: `Create project folder for "${this._project.project_number}".`,
          onclick: () =>
          {
            html.loading();
            return window.api.hooks.applyFilters('create_project_folder',
              new Promise(resolve => resolve(false)) as Promise<boolean>,
              this._project,
              this._projectPaths)
              .then(created => created ? this.loadProject(this._project) : null)
              .finally(() => html.loading(false)).then(() => false);
          },
          classes: ['ignore-search'],
        },
      ]);
    }
  }

  init (project: Project): Promise<boolean>
  {
    // Load project.
    return new Promise(resolve => resolve(this.loadProject(project)))
      // Make sure search is focussed and return `true`.
      .then(() => (setTimeout(() => this.$div.find('input.search-files').trigger('focus'), 5), true));
  }

  onactivate (project: Project): Promise<boolean>
  {
    return new Promise(resolve =>
      resolve(!this._project || project.project_id !== this._project.project_id))
      // Load when needed.
      .then(load => load ? this.loadProject(project) : null)
      // Make sure search is focussed and return `true`.
      .then(() => (setTimeout(() => this.$div.find('input.search-files').trigger('focus'), 5), true));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispose ()
  {
    // dispose Watcher !!
  }
}