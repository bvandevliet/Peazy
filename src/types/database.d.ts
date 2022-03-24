/* eslint-disable camelcase */

interface Project
{
  [x: string]: any;
  children?: Project[];
  install_id?: any;
  install_number?: string;
  install_description?: string;
  project_id: any;
  project_number: string;
  project_description: string;
  relation_id: any;
  relation_name: string;
  relation_country_id?: any;
  relation_country_name?: string;
  status_id: any;
  status_name: string;
  price?: number;
  date_start?: string | Date;
  date_finish?: string | Date;
  notes?: string;
  sales_manager_id?: any;
  sales_manager_name?: string;
  project_manager_id?: any;
  project_manager_name?: string;
  project_engineer_id?: any;
  project_engineer_name?: string;
}

type ProjectId = AtLeastOne<{project_id: Project['project_id'], project_number: Project['project_number']}>;

type ProjectAndInstallNumber = {project_number: Project['project_number'], install_number?: Project['install_number']};

interface getProjectArgs
{
  /**
   * Is the query for a single project? Default is `false`.
   */
  single?: boolean;
  /**
   * Array of project IDs this query is for.
   */
  project_ids?: Project['project_id'][];
  /**
   * Array of project numbers this query is for.
   */
  project_numbers?: Project['project_number'][];
  /**
   * Search for projects that contain these search queries.
   *
   * `maxSelect` is handled by the application and should not be included in this db query,
   * since the original search query may contain regexes, which are extracted from this argument
   * to be handled by the app instead.
   */
  search_for?: string[];
  /**
   * Get children of this install number.
   */
  siblings_of?: Project['install_number'];
  /**
   * Get children of this install number including the project itself.
   *
   * The project itself should also be included in the result
   * to reduce requests when building up the project tree,
   * since then we can directly obtain the next parent installation from it.
   */
  children_of?: Project['install_number'];
  /**
   * Array of project states to query.
   */
  status?: Project['status_id'][];
  /**
   * Order `ASC` or `DESC`, default is `ASC`.
   */
  orderBy?: Order;
}

interface Relation
{
  [x: string]: any;
  relation_id: any;
  relation_type?: any; // customer | contactperson | ..
  relation_first_name?: string; // contactperson
  relation_name: string;
  relation_address?: string;
  relation_zip?: string;
  relation_city_id?: any;
  relation_city?: string;
  relation_country_id?: any;
  relation_country_name: string;
  relation_email_1?: string;
  relation_email_2?: string;
  relation_phone_1?: string;
  relation_phone_2?: string;
}

interface PlanningTask
{
  [x: string]: any;
  task_id: any;
  parent_id: any;
  project_id?: any;
  project_number: string;
  task_description: string;
  date_start: string;
  date_start_actual: string;
  date_finish: string;
  date_finish_actual: string;
  date_delivery: string;
}

interface getPlanningArgs
{
  /**
   * The project number this query is for.
   */
  project_number?: Project['project_number'];
  /**
   * The parent task ID, default is `NULL` and results in top level tasks, i.e. project records.
   */
  parent_id?: string;
  /**
   * Order `ASC` or `DESC`, default is `ASC`.
   */
  orderBy?: Order;
}

interface AttachedDocument
{
  project_id?: any;
  title: string;
  version: number;
  is_hidden?: boolean;
  path: string;
  size?: number;
  date_created?: string | Date;
  date_modified?: string | Date;
}

interface Resource
{
  resource_id: any;
  resource_first_name?: string;
  resource_name: string;
  is_inactive?: boolean;
  resource_email_1?: string;
  resource_email_2?: string;
  resource_phone_1?: string;
  resource_phone_2?: string;
}

interface Timesheet
{
  project_id?: any;
  resource_id: any;
  resource_first_name?: string;
  resource_name: string;
  worktype_id: any;
  worktype_code?: any;
  worktype_name: string;
  date_start: string | Date;
  date_end: string | Date;
  amount: number;
  rate_internal: number;
  expense?: number;
}