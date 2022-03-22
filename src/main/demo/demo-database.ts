/* eslint-disable camelcase */

export const DATABASE: {
  projects: Partial<Project>[],
  relations: Partial<Relation>[],
  tasks: Partial<PlanningTask>[],
  documents: Partial<AttachedDocument>[],
  resources: Partial<Resource>[],
  timesheets: Partial<Timesheet>[],
  worktypes: Array<{
    worktype_id: any,
    worktype_code: string,
    worktype_name: string,
  }>,
} = {
  projects: [
    {
      install_id: null,
      project_id: '',
      project_number: '',
      project_description: '',
      relation_id: null,
      status_name: 'order',
      price: null,
      date_start: null,
      date_finish: null,
      notes: null,
      sales_manager_id: null,
      project_manager_id: null,
      project_engineer_id: null,
    },
  ],
  relations: [
    {
      relation_id: '',
      relation_name: '',
      relation_country_name: '',
      relation_address: '',
    },
  ],
  tasks: [
    {
      task_id: '',
      parent_id: null,
      project_id: '',
      task_description: '',
      date_start: null,
      date_start_actual: null,
      date_finish: null,
      date_finish_actual: null,
      date_delivery: null,
    },
  ],
  documents: [
    {
      project_id: '',
      title: '',
      version: null,
      is_hidden: null,
      path: '',
      size: null,
      date_created: '',
      date_modified: '',
    },
  ],
  resources: [
    {
      resource_id: '',
      resource_first_name: null,
      resource_name: '',
    },
  ],
  timesheets: [
    {
      project_id: '',
      resource_id: '',
      worktype_id: '',
      date_start: '',
      date_end: '',
      amount: 0,
      rate_internal: 0,
    },
  ],
  worktypes: [
    {
      worktype_id: '',
      worktype_code: '',
      worktype_name: '',
    },
  ],
};