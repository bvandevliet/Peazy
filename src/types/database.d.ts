interface Project
{
  [x: string]: any;
  children?: Project[];
  /* eslint-disable camelcase */
  install_id?: any;
  install_number?: string;
  install_description?: string;
  project_id: any;
  project_number: string;
  project_description: string;
  customer_id: any;
  customer_name: string;
  customer_country_id?: any;
  customer_country_name?: string;
  status_id: any;
  status_name: string;
  price?: number;
  date_created?: string | Date;
  date_modified?: string | Date;
  date_delivery?: string | Date;
  notes?: string;
  sales_manager_id?: any;
  sales_manager_name?: string;
  project_manager_id?: any;
  project_manager_name?: string;
  project_engineer_id?: any;
  project_engineer_name?: string;
}

// `Pick` didn't work as expected, but the below doesn't look like the best approach either !!
type ProjectId = AtLeastOne<{project_id: Project['project_id'], project_number: Project['project_number']}>;

interface getProjectArgs
{
  /**
   * Is the query for a single project? Default is `false`.
   */
  single?: boolean,
  /**
   * Array of project IDs this query is for.
   */
  project_ids?: Project['project_id'][],
  /**
   * Array of project numbers this query is for.
   */
  project_numbers?: Project['project_number'][],
  /**
   * Get children of this install number.
   */
  siblings_of?: Project['install_number'];
  /**
   * Get children of this install number.
   */
  children_of?: Project['install_number'];
  /**
   * Array of project states to query.
   */
  status?: Project['status_id'][],
  /**
   * If evaluates to `false`, skip request and resolve immediately.
   */
  condition?: () => boolean,
  /**
   * Filter each project to control whether it should trigger the callback.
   */
  filter?: (project: Project) => boolean,
  /**
   * Order `ASC` or `DESC`, default is `ASC`.
   */
  orderBy?: Order,
}

interface AttachedDocument
{
  title: string,
  version: number,
  is_visible?: boolean,
  path: string,
  size?: number,
  date_created?: string | Date,
  date_modified?: string | Date,
}

interface WorkHours
{
  resource_id: any,
  resource_first_name?: string,
  resource_name: string,
  worktype_id: any,
  worktype_code?: any,
  worktype_name: string,
  date_start: string | Date,
  date_end: string | Date,
  amount: number,
  rate_internal: number,
  expense: number,
}