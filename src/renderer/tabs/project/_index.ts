import DateTime from '../../inc/class-datetime.js';
import Tabs from '../../inc/class-tabs.js';
import TableList from '../../inc/class-html-table-list.js';
import Search from '../../inc/class-search.js';
import * as main from '../../index.js';
import * as html from '../../inc/functions-html.js';
import * as contextMenu from '../../inc/templates-contextmenu.js';

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
        id: 'project-docs',
        template: 'tmpl-li-project-docs',
        callback: () => null,
        onclick: () => new Promise(resolve => resolve(true)),
      },
      {
        id: 'project-work',
        template: 'tmpl-li-project-work',
        callback: () => null,
        onclick: () => new Promise(resolve => resolve(true)),
      },
      {
        id: 'project-notes',
        template: 'tmpl-li-project-notes',
        callback: () => null,
        onclick: () => new Promise(resolve => resolve(false)),
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
      .text(window.api.core.applyFilters('project_project_number', project.project_number, project))
      .attr('title', window.api.core.applyFilters('project_project_number_title', `${project.project_description}  •  ${project.customer_name}`, project));

    // Make sure rows are activated in the main window.
    main.updateActiveStates(this.$li);

    // Print project info.
    this._projectInfo.empty();
    (window.api.core.applyFilters('project_info_tbodies', [
      [[
        {
          template: 'tmpl-th-no-wrap',
          text: '[Install] Project',
        },
        {
          text: `[${project.install_number}] ${project.project_number}`,
        },
      ],
      [
        {
          template: 'tmpl-th-no-wrap',
          text: 'Description',
        },
        {
          text: project.project_description,
        },
      ],
      [
        {
          template: 'tmpl-th-no-wrap',
          text: 'Customer (country)',
        },
        {
          text: `${project.customer_name} (${project.customer_country_name})`,
          onclick: () => new Promise(resolve => resolve(false)),
        },
      ]],
      [[
        {
          template: 'tmpl-th-no-wrap',
          text: 'Status',
        },
        {
          text: project.status_name,
        },
      ],
      [
        {
          template: 'tmpl-th-no-wrap',
          text: 'Date created',
        },
        {
          text: new DateTime(project.date_created).getDate(),
        },
      ],
      [
        {
          template: 'tmpl-th-no-wrap',
          text: 'Date delivery',
        },
        {
          text: new DateTime(project.date_delivery).getDate(),
        },
      ]],
      [[
        {
          template: 'tmpl-th-no-wrap',
          text: 'Price',
        },
        {
          text: window.api.core.applyFilters('project_price', project.price, project),
        },
      ],
      [
        {
          template: 'tmpl-th-no-wrap',
          text: 'Notes',
        },
        {
          text: project.notes,
        },
      ]],
      [[
        {
          template: 'tmpl-th-no-wrap',
          text: 'Sales manager',
        },
        {
          text: project.sales_manager_name,
          onclick: () => new Promise(resolve => resolve(false)),
        },
      ],
      [
        {
          template: 'tmpl-th-no-wrap',
          text: 'Project manager',
        },
        {
          text: project.project_manager_name,
          onclick: () => new Promise(resolve => resolve(false)),
        },
      ],
      [
        {
          template: 'tmpl-th-no-wrap',
          text: 'Project engineer',
        },
        {
          text: project.project_engineer_name,
          onclick: () => new Promise(resolve => resolve(false)),
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
    return this._projectTabs.tryTriggerActive()[2];
  }

  /**
   * Get html for a project tree row.
   *
   * @param project The project.
   * @param depth   Depth in the project tree.
   */
  projectRow (project: Project, depth = 0)
  {
    const project_number = window.api.core.applyFilters('project_project_number', project.project_number, project);
    // const install_number = window.api.core.applyFilters('project_install_number', project.install_number, project);

    // Table cells definition for a project tree row.
    const $tr = TableList.buildRow([
      {
        template: 'tmpl-td-project-date',
        text: project.date_created ? new DateTime(project.date_created).getYearMonth() : '-',
        title: project.date_created ? new DateTime(project.date_created).getDate() : null,
      },
      {
        template: 'tmpl-td-project-status',
        text: window.api.core.applyFilters('project_status_id', project.status_id, project),
        title: window.api.core.applyFilters('project_status_id_title', project.status_name, project),
      },
      {
        template: 'tmpl-td-project-number',
        text: project_number,
        title: window.api.core.applyFilters('project_project_number_title', `${project.project_description}  •  ${project.customer_name}`, project),
        onclick: (_$td, $tr) =>
        {
          html.loading();

          // If project row is not currently active, check if project tab already exists, if so, activate it and bail.
          if (!$tr.hasClass('is-selected'))
          {
            const existingTab = main.activateTabIfExists(`project-${project.project_id}`);
            if (undefined !== existingTab) return existingTab.finally(() => html.loading(false)).then(() => false);
          }

          // Length of next-level project rows.
          const trNextCount = $tr.next(`tr.tree-depth-${(depth + 1)}`).length;

          // Append new child rows if any and load the clicked project when it passes by in the tree build.
          let clickedProject: Project = null;
          return window.api.project.getProjects({ children_of: project_number, orderBy: 'DESC' }, project =>
          {
            const this_project_number = window.api.core.applyFilters('project_project_number', project.project_number, project);

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
          return window.api.core.applyFilters('project_entry_contextmenu',
            [
              contextMenu.openProjectFolder(project),
              contextMenu.copyProjectPath(project),
            ],
            project);
        },
      },
      {
        template: 'tmpl-td-project-description',
        text: window.api.core.applyFilters('project_project_description', project.project_description, project),
        title: window.api.core.applyFilters('project_project_description_title', `${project.project_description}  •  ${project.customer_name}`, project),
      },
    ])
      // Add an ID to the project row to target it when updating active tab.
      .attr('row-id', `project-${project.project_id}`)
      // Add class attribute to indicate the tree depth.
      .addClass(`tree-depth-${depth}`);

    const $td_project_number = $tr.find('>th.project-number');
    for (let i = 0; i < depth; i++)
    {
      $td_project_number.prepend('<span class="indent" />');
    }

    return $tr;
  }

  /**
   * Builds html for the project tree
   * starting from the given project and its children up to the top-most install project.
   *
   * And loads the clicked project when it passes by in the tree build.
   *
   * @param project Entry project.
   */
  private async rebuildProjectTreeAndLoad ()
  {
    this._projectsTable.empty();

    const tab_project_number = window.api.core.applyFilters('project_project_number', this._project.project_number, this._project);

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
      const this_project_number = window.api.core.applyFilters('project_project_number', project.project_number, project);

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

    // Load the clicked project.
    if (null !== clickedProject) await this.loadProject(clickedProject);
  }

  init ()
  {
    return this.rebuildProjectTreeAndLoad().then(() => true);
  }

  onactivate (): Promise<boolean>
  {
    // Make sure rows are activated in the main window.
    main.updateActiveStates(this.$li);

    return new Promise(resolve => resolve(true));
  }

  dispose ()
  {
    console.log(`disposed ${this._project.project_number}`);
  }
}