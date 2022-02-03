/**
 * Core class used to implement action and filter hook functionality.
 */
export default class Hook
{
  /**
   * Filter callbacks.
   */
  public filters: Array<<T> (value?: T, ...args: any) => T>[] = [];

  /**
   * Action callbacks.
   */
  // public actions: Array<<T> (value?: T, ...args: any) => T>[] = [];

  /**
   * Adds a callback function to a filter hook.
   *
   * @param callback The callback to be run when the filter is applied.
   * @param priority The order in which the functions associated with a particular filter
   *                 are executed. Lower numbers correspond with earlier execution,
   *                 and functions with the same priority are executed in the order
   *                 in which they were added to the filter.
   */
  public addFilter (callback: (value?: any, ...args: any) => any, priority: number)
  {
    undefined === this.filters[priority]
      ? this.filters[priority] = [callback]
      : this.filters[priority].push(callback);
  }

  /**
   * Calls the callback functions that have been added to a filter hook.
   *
   * @param value The value being filtered.
   * @param args  Optional arguments to pass with the callback functions.
   *
   * @return      The filtered value.
   */
  public applyFilters <T> (value?: T, ...args: any): T
  {
    this.filters.forEach(priority =>
      priority.forEach(cb => value = cb(value, ...args)));

    return value;
  }
}