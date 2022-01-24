/**
 * Core class used to implement action and filter hook functionality.
 */
export default class Hook
{
  /**
   * Filter callbacks.
   */
  public filters: Array<(...args: any) => unknown>[] = [];

  /**
   * Action callbacks.
   */
  // public actions: Array<(...args: any) => unknown>[] = [];

  /**
   * Adds a callback function to a filter hook.
   *
   * @param callback The callback to be run when the filter is applied.
   * @param priority The order in which the functions associated with a particular filter
   *                 are executed. Lower numbers correspond with earlier execution,
   *                 and functions with the same priority are executed in the order
   *                 in which they were added to the filter.
   */
  public addFilter (callback: (...args: any) => unknown, priority: number)
  {
    undefined === this.filters[priority]
      ? this.filters[priority] = [callback]
      : this.filters[priority].push(callback);
  }

  /**
   * Calls the callback functions that have been added to a filter hook.
   *
   * @param args Additional parameters to pass to the callback functions.
   *             This array is expected to include the to be filtered value at index 0.
   *
   * @return     The filtered value.
   */
  public applyFilters (...args: any): unknown
  {
    this.filters.forEach(priority =>
      priority.forEach(cb => args[0] = cb(...args)));

    return args[0];
  }
}