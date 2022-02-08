/**
 * A wrapper class to handle html for tabs.
 */
export default class projectTab implements tabPage
{
  readonly $div: JQuery<HTMLDivElement>;
  readonly project: Project;

  constructor ($div: JQuery<HTMLDivElement>, project: Project)
  {
    this.$div = $div;
    this.project = project;
  }

  onactivate ()
  {
    console.log(`activated ${this.project.project_number}`);
  }

  dispose ()
  {
    console.log(`disposed ${this.project.project_number}`);
  }
}