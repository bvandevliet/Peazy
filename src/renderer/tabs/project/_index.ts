import DateTime from '../../inc/class-datetime.js';
import Tabs from '../../inc/class-tabs.js';
import TableList from '../../inc/class-html-table-list.js';
import Search from '../../inc/class-search.js';
import * as html from '../../inc/functions-html.js';

/**
 * A wrapper class to handle html for tabs.
 */
export default class projectTab implements tabPage
{
  readonly $div: JQuery<HTMLDivElement>;
  readonly project: Project;

  private _mainTabs: Tabs;
  private _projectBrowser: TableList;
  private _projectSearch: Search;

  /**
   * Prints html to the project content window.
   *
   * @param project The project.
   */
  private loadProject (project: Project)
  {
    // return new Promise(resolve => resolve(true));
  }

  /**
   * Builds html for the project tree.
   */
  private async buildProjectTree ()
  {
    this._projectBrowser.empty();

    /**
     * Get html for a project tree row.
     *
     * @param project The project.
     * @param depth   Depth in the project tree.
     */
    const projectRow = (project: Project, depth = 0) =>
    {
      const project_number = window.api.core.applyFilters('project_project_number', project.project_number, project);
      // const install_number = window.api.core.applyFilters('project_install_number', project.install_number, project);

      // Ttable cells definition for a project tree row.
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
          onclick: $tr =>
          {
            html.loading();

            // Remove appended child rows if any.
            let $trNext = $tr.next(`tr.tree-depth-${(depth + 1)}`);
            while ($trNext.length)
            {
              $trNext.remove();
              $trNext = $tr.next(`tr.tree-depth-${(depth + 1)}`);
            }

            // Append new child rows if any.
            return window.api.project.getProjects({ children_of: project_number, orderBy: 'DESC' }, project =>
            {
              const this_project_number = window.api.core.applyFilters('project_project_number', project.project_number, project);

              if (this_project_number === project_number && null !== project.project_id)
              {
                // Load the clicked project.
                this.loadProject(project);
              }
              else
              {
                // Append child row.
                $tr.after(projectRow(project, depth + 1));
              }
            })
              .finally(() => html.loading(false));
          },
        },
        {
          callback: $td => $td.append(html.getTemplateProjectActions(project)),
          classes: ['hover-actions', 'ignore-search'],
        },
        {
          template: 'tmpl-td-project-description',
          text: window.api.core.applyFilters('project_project_description', project.project_description, project),
          title: window.api.core.applyFilters('project_project_description_title', `${project.project_description}  •  ${project.customer_name}`, project),
        },
      ])
        .addClass(`tree-depth-${depth}`);

      const $td_project_number = $tr.find('>th.project-number');
      for (let i = 0; i < depth; i++)
      {
        $td_project_number.prepend('<span class="indent" />');
      }

      return $tr;
    };

    // Get the project tree build up from the current project.
    const installProject = await window.api.project.getProjectTree(this.project);

    /**
     * Recursively builds html for the project tree
     * starting from the found top-most project down for as long a children are defined.
     *
     * @param project Entry project.
     * @param depth   Entry depth.
     */
    const projectWalker = (project: Project, depth = 0) =>
    {
      this._projectBrowser.tbody().append(projectRow(project, depth));

      project.children?.forEach(project => projectWalker(project, depth + 1));
    };

    // Initiate recursive project tree builder.
    projectWalker(installProject);
  }

  constructor ($div: JQuery<HTMLDivElement>, project: Project)
  {
    // Define class globals.
    this.$div = $div;
    this.project = project;

    // Load the project tab page template.
    this.$div.append(html.getTemplateClone('tmpl-tab-page-project'));

    // Create a `TableList` wrapper for the projects table html element.
    this._projectBrowser = new TableList(this.$div.find('table.table-projects') as JQuery<HTMLTableElement>);

    // Initiate the search handler for the projects table.
    this._projectSearch = new Search(this._projectBrowser.$table, '>tbody>tr', tr =>
      $(tr).find('>*:not(.ignore-search)').toArray().map(td => td.textContent));

    /**
     * Bind `projectSearch` to search events on the project browser.
     */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisClass = this;
    (this.$div.find('input.search-projects') as JQuery<HTMLInputElement>)
      .on('search keyup', function ()
      {
        thisClass._projectSearch.search(this.value, true);
      });

    // Initiate the project tabs.
    this._mainTabs = new Tabs();

    // Add project tabs and activate first.
    ([
      {
        id: 'project-info',
        template: 'tmpl-li-project-info',
        callback: () => null,
        // onclick: null,
      },
      {
        id: 'project-docs',
        template: 'tmpl-li-project-docs',
        callback: () => null,
        // onclick: null,
      },
      {
        id: 'project-work',
        template: 'tmpl-li-project-work',
        callback: () => null,
        // onclick: null,
      },
      {
        id: 'project-notes',
        template: 'tmpl-li-project-notes',
        callback: () => null,
        // onclick: null,
      },
    ] as tabItem[]).forEach((projectSubTab, index) =>
    {
      this._mainTabs.addTab(projectSubTab, index === 0);
    });

    // Append project tabs to the content window.
    this.$div.find('div.project-content').append(this._mainTabs.$container);
  }

  onactivate ()
  {
    return this.buildProjectTree();
  }

  dispose ()
  {
    console.log(`disposed ${this.project.project_number}`);
  }
}