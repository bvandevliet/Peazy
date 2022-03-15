import DateTime from '../../inc/class-datetime.js';
import Tabs from '../../inc/class-tabs.js';
import TableList from '../../inc/class-html-table-list.js';
import Search from '../../inc/class-search.js';
import * as main from '../../index.js';
import * as html from '../../inc/functions-html.js';
import * as contextMenu from '../../inc/templates-contextmenu.js';
import workTab from './work.js';
import docsTab from './docs.js';
import filesTab from './files.js';

/**
 * A wrapper class to handle html for tabs.
 */
export default class projectTab implements tabPage
{
  readonly $div;
  readonly $li;

  private _project;

  private _projectInfo = new TableList(html.getTemplateClone('tmpl-table-info') as HTMLTableElement);

  private _projectTabs;
  private _projectsTable;
  private _projectSearch;

  private _tabs: Record<string, tabPage> = {};

  /**
   * Current active project of this tab.
   */
  get project ()
  {
    return this._project;
  }

  /**
   *
   * @param $div                The tab page `div` element.
   * @param $li                 The tab `li` element.
   * @param project             The project to initiate this tab with.
   */
  constructor ($div: JQuery<HTMLDivElement>, $li: JQuery<HTMLLIElement>, project: Project)
  {
    // Define class globals.
    this.$div = $div;
    this.$li = $li;
    this._project = project;

    // Load the project tab page template.
    this.$div.append(html.getTemplateClone('tmpl-tab-page-project'));

    // Create a `TableList` wrapper for the projects table html element.
    this._projectsTable = new TableList(this.$div.find('table.table-projects') as JQuery<HTMLTableElement>);

    // Initiate the search handler for the projects table.
    this._projectSearch = new Search(this._projectsTable.$table, '>tbody>tr', tr =>
      $(tr).find('>*:not(.ignore-search)').toArray().map(td => td.textContent));

    /**
     * Bind `projectSearch` to search events on the project browser.
     */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisClass = this;
    (this.$div.find('input.search-projects') as JQuery<HTMLInputElement>).on('input', function ()
    {
      thisClass._projectSearch.search(this.value, true);
    });

    // Initiate the project tabs.
    this._projectTabs = new Tabs();

    // Add project tabs and activate first.
    ([
      {
        id: 'project-info',
        template: 'tmpl-li-project-info',
        // eslint-disable-next-line no-shadow
        callback: $div => $div.append($(html.getTemplateClone('tmpl-entry-content')).append(this._projectInfo.$table)),
        onclick: () => new Promise(resolve => resolve(true)),
      },
      {
        id: 'project-planning',
        template: 'tmpl-li-project-planning',
        callback: () => null,
      },
      {
        id: 'project-docs',
        template: 'tmpl-li-project-docs',
        callback: ($div, $li) => this._tabs.docsTab = new docsTab($div, $li),
        onclick: $li =>
        {
          html.loading();
          return ($li.hasClass('is-active') ? this._tabs.docsTab.init(this.project) : this._tabs.docsTab.onactivate(this.project))
            .finally(() => html.loading(false));
        },
      },
      {
        id: 'project-work',
        template: 'tmpl-li-project-work',
        callback: ($div, $li) => this._tabs.workTab = new workTab($div, $li),
        onclick: $li =>
        {
          html.loading();
          return ($li.hasClass('is-active') ? this._tabs.workTab.init(this.project) : this._tabs.workTab.onactivate(this.project))
            .finally(() => html.loading(false));
        },
      },
      {
        id: 'project-orders',
        template: 'tmpl-li-project-orders',
        callback: () => null,
      },
      {
        id: 'project-notes',
        template: 'tmpl-li-project-notes',
        callback: () => null,
      },
      {
        id: 'project-files',
        template: 'tmpl-li-project-files',
        callback: ($div, $li) => this._tabs.filesTab = new filesTab($div, $li),
        onclick: $li =>
        {
          html.loading();
          return ($li.hasClass('is-active') ? this._tabs.filesTab.init(this.project) : this._tabs.filesTab.onactivate(this.project))
            .finally(() => html.loading(false));
        },
      },
    ] as tabItem[]).forEach((projectSubTab, index) =>
    {
      this._projectTabs.addTab(projectSubTab, index === 0);
    });

    // Append project tabs to the content window.
    this.$div.find('div.project-content').append(this._projectTabs.$container);
  }

  /**
   * Prints html to the project content window.
   *
   * @param project The project.
   */
  private loadProject (project: Project)
  {
    // Set the current project for this tab.
    this._project = project;

    // Overwrite tab ID.
    this.$li
      .add(this.$div)
      .attr('tab-id', `project-${project.project_id}`);

    // Overwrite tab text and title.
    this.$li
      .find('>a').first()
      .text(window.api.hooks.applyFilters('project_project_number', project.project_number, project))
      .attr('title', window.api.hooks.applyFilters('project_project_number_title', `${project.project_description}  •  ${project.customer_name}`, project));

    // Make sure rows are activated in the main window.
    main.updateActiveStates(this.$li);

    // Print project info.
    this._projectInfo.empty();
    (window.api.hooks.applyFilters('project_info_tbodies', [
      [[
        {
          template: 'tmpl-th-narrow',
          text: '[Install-] Project number',
        },
        {
          text: `[${project.install_number}] ${project.project_number}`,
        },
      ],
      [
        {
          template: 'tmpl-th-narrow',
          text: 'Description',
        },
        {
          text: project.project_description,
        },
      ],
      [
        {
          template: 'tmpl-th-narrow',
          text: 'Customer (Country)',
        },
        {
          text: `${project.customer_name} (${project.customer_country_name})`,
          onclick: () => null,
        },
      ]],
      [[
        {
          template: 'tmpl-th-narrow',
          text: 'Status',
        },
        {
          text: project.status_name,
        },
      ],
      [
        {
          template: 'tmpl-th-narrow',
          text: 'Price',
        },
        {
          text: window.api.hooks.applyFilters('project_price', project.price, project),
        },
      ],
      [
        {
          template: 'tmpl-th-narrow',
          text: 'Date start',
        },
        {
          text: new DateTime(project.date_start).getDate(),
        },
      ],
      [
        {
          template: 'tmpl-th-narrow',
          text: 'Date delivery',
        },
        {
          text: new DateTime(project.date_finish).getDate(),
        },
      ]],
      [[
        {
          template: 'tmpl-th-narrow',
          text: 'Notes',
        },
        {
          text: project.notes,
        },
      ]],
      [[
        {
          template: 'tmpl-th-narrow',
          text: 'Sales manager',
        },
        {
          text: project.sales_manager_name,
          onclick: () => null,
        },
      ],
      [
        {
          template: 'tmpl-th-narrow',
          text: 'Project manager',
        },
        {
          text: project.project_manager_name,
          onclick: () => null,
        },
      ],
      [
        {
          template: 'tmpl-th-narrow',
          text: 'Project engineer',
        },
        {
          text: project.project_engineer_name,
          onclick: () => null,
        },
      ]],
    ], project) as tableCellItem[][][]).forEach((tbody, index) =>
    {
      tbody.forEach(tableRow =>
      {
        this._projectInfo.appendItem(tableRow, index);
      });
    });

    // Reload active tab.
    return this._projectTabs.tryTriggerActive().promise;
  }

  /**
   * Get html for a project tree row.
   *
   * @param project The project.
   * @param depth   Depth in the project tree.
   */
  projectRow (project: Project, depth = 0)
  {
    const project_number = window.api.hooks.applyFilters('project_project_number', project.project_number, project);
    // const install_number = window.api.hooks.applyFilters('project_install_number', project.install_number, project);

    // Table cells definition for a project tree row.
    const $tr = TableList.buildRow([
      {
        template: 'tmpl-td-project-date',
        text: project.date_start ? new DateTime(project.date_start).getYearMonth() : '-',
        title: project.date_start ? new DateTime(project.date_start).getDate() : null,
      },
      {
        template: 'tmpl-td-project-status',
        text: window.api.hooks.applyFilters('project_status_id', project.status_id, project),
        title: window.api.hooks.applyFilters('project_status_id_title', project.status_name, project),
      },
      {
        template: 'tmpl-td-project-number',
        text: project_number,
        title: window.api.hooks.applyFilters('project_project_number_title', `${project.project_description}  •  ${project.customer_name}`, project),

        // IMPROVE FOR READABILITY !!
        onclick: (_$td, $tr) =>
        {
          html.loading();

          // If project row is not currently active, check if project tab already exists, if so, activate it and bail.
          if (!$tr.hasClass('is-selected'))
          {
            const existingTab = main.activateTabIfExists(`project-${project.project_id}`);
            if (existingTab.$li.length) return existingTab.promise.finally(() => html.loading(false)).then(() => null);
          }

          // Length of next-level project rows.
          const trNextCount = $tr.next(`tr.tree-depth-${(depth + 1)}`).length;

          // Append new child rows if any and load the clicked project when it passes by in the tree build.
          let clickedProject: Project = null;
          return window.api.project.getProjects({ children_of: project.project_number, orderBy: 'DESC' }, project =>
          {
            const this_project_number = window.api.hooks.applyFilters('project_project_number', project.project_number, project);

            if (this_project_number === project_number)
            {
              // Set clicked project.
              clickedProject = project;
            }

            // Append child rows only if they were not already there.
            // A fresh rebuild can still be triggered with a tab `onclick`.
            else if (!trNextCount)
            {
              $tr.after(this.projectRow(project, depth + 1));
            }
          })
            // If clicked project exists, load it.
            .then(() => clickedProject ? this.loadProject(project) : null)
            .finally(() => html.loading(false)).then(() => null !== clickedProject);
        },
        onmiddleclick: () =>
        {
          html.loading();
          main.loadProject(project)
            .finally(() => html.loading(false));
        },
        oncontextmenu: () =>
        {
          return window.api.hooks.applyFilters('contextmenu_project_item_tree',
            (project.project_number === this.project.project_number ? [] : [
              contextMenu.openProjectInNewTab(() =>
              {
                html.loading();
                main.loadProject(project)
                  .finally(() => html.loading(false));
              }),
              contextMenu.separator,
            ]).concat([
              contextMenu.openProjectFolder(project),
              contextMenu.copyProjectPath(project),
            ]),
            project);
        },
      },
      {
        template: 'tmpl-td-project-description',
        text: window.api.hooks.applyFilters('project_project_description', project.project_description, project),
        title: window.api.hooks.applyFilters('project_project_description_title', `${project.project_description}  •  ${project.customer_name}`, project),
      },
    ])
      // Add an ID to the project row to target it when updating active tab.
      .attr('row-id', `project-${project.project_id}`)
      // Add class attribute to indicate the tree depth.
      .addClass(`tree-depth-${depth}`);

    const $td_project_number = $tr.find('>th.project-number');

    // Append project tree depth indentations.
    for (let i = 0; i < depth; i++)
    {
      $td_project_number.prepend('<span class="indent" />');
    }

    // Set the overall progress indicator (DRY!!).
    $td_project_number
      .prepend($(document.createElement('div')).addClass('progress-line')
        .css('width', (() =>
        {
          const
            timeStart = (new Date(project.date_start)).getTime(),
            timeFinish = (new Date(project.date_finish)).getTime();

          const
            timelineSpan = Math.max(0, timeFinish - timeStart),
            progress = timelineSpan !== 0 ? Math.max(0, Date.now() - timeStart) / timelineSpan * 100 : 0;

          return `${Math.min(100, progress)}%`;
        })()));

    return $tr;
  }

  /**
   * Builds html for the project tree
   * starting from the given project and its children up to the top-most install project.
   *
   * And loads the clicked project when it passes by in the tree build.
   */
  private async rebuildProjectTreeAndLoad ()
  {
    this._projectsTable.empty();

    const tab_project_number = window.api.hooks.applyFilters('project_project_number', this._project.project_number, this._project);

    let clickedProject: Project = null;

    /**
     * Recursively builds html for the project tree
     * starting from the given top-most project down for as long a children are defined.
     *
     * @param project Entry project.
     * @param depth   Entry depth.
     */
    const projectWalker = (project: Project, depth = 0) =>
    {
      const this_project_number = window.api.hooks.applyFilters('project_project_number', project.project_number, project);

      if (this_project_number === tab_project_number)
      {
        // Set clicked project.
        clickedProject = project;
      }

      this._projectsTable.tbody().append(this.projectRow(project, depth));

      project.children?.forEach(project => projectWalker(project, depth + 1));
    };

    // Initiate recursive project tree builder.
    projectWalker(await window.api.project.getProjectTree(this._project));

    // Activate current project row.
    this._projectsTable.$table.find('tr')
      .filter((_i, elem) =>
      {
        return $(elem).attr('row-id') === `project-${this._project.project_id}`;
      })
      .addClass('is-selected');

    // Make sure search is up-to-date.
    this.$div.find('input.search-projects').trigger('input');

    // Load the clicked project when valid, else fallback to the project initially set in the tab constructor.
    await this.loadProject(!window.api.core.isEmpty(clickedProject?.project_id) ? clickedProject : this._project);
  }

  init ()
  {
    return this.rebuildProjectTreeAndLoad().then(() => true);
  }

  onactivate (): Promise<boolean>
  {
    // Make sure rows are activated in the main window.
    main.updateActiveStates(this.$li);

    // Find the active sub tab.
    const activeTab = Object.values(this._tabs).find(tab => tab.$li.hasClass('is-active'));

    // Trigger `onactivate` of the current active sub tab if any (the "info" tab is technically not a sub tab).
    return (new Promise(resolve =>
      resolve(activeTab)) as Promise<tabPage>)
      .then(tab => tab?.onactivate(this.project) || true);
  }

  dispose ()
  {
    // Dispose all sub tabs.
    Object.values(this._tabs).forEach(tab => tab.dispose());
  }
}