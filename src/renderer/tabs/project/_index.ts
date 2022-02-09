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

  private loadProject (project: Project)
  {
    return new Promise(resolve => resolve(true));
  }

  private async fetchProjectBrowser ()
  {
    this._projectBrowser.empty();

    const installProject = await window.api.project.getProjectTree(this.project);

    const projectWalker = (project: Project, depth = 0) =>
    {
      const project_number = window.api.core.applyFilters('project_project_number', project.project_number, project);
      // const install_number = window.api.core.applyFilters('project_install_number', project.install_number, project);

      const $tr = this._projectBrowser.appendItem([
        {
          template: 'tmpl-td-project-date',
          text: project.date_created ? new DateTime(project.date_created).getDate() : '-',
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
          onclick: null !== project.project_id ? () =>
          {
            html.loading();
            return this.loadProject(project)
              .finally(() => html.loading(false));
          } : null,
        },
        {
          template: 'tmpl-td-project-description',
          text: window.api.core.applyFilters('project_project_description', project.project_description, project),
          title: window.api.core.applyFilters('project_project_description_title', `${project.project_description}  •  ${project.customer_name}`, project),
        },
      ]);

      const $td_project_number = $tr.find('>th.project-number');
      for (let i = 0; i < depth; i++)
      {
        $td_project_number.prepend('<span class="indent" />');
      }

      project.children?.forEach(project => projectWalker(project, depth + 1));
    };

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
    this._projectSearch = new Search(this._projectBrowser.$table, '>tbody>tr', tr => $(tr).find('>th, >td').toArray().map(td => td.textContent));

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

    // Define the project tabs.
    const projectSubTabs: tabItem[] = [
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
    ];

    // Add project tabs and activate first.
    projectSubTabs.forEach((projectSubTab, index) =>
    {
      this._mainTabs.addTab(projectSubTab, index === 0);
    });

    // Append project tabs to the content window.
    this.$div.find('div.project-content').append(this._mainTabs.$container);
  }

  onactivate ()
  {
    return this.fetchProjectBrowser();
  }

  dispose ()
  {
    console.log(`disposed ${this.project.project_number}`);
  }
}