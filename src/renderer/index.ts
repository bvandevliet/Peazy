// import * as html from './inc/functions-html.js';

/**
 * A filter example.
 */
window.addEventListener('DOMContentLoaded', () =>
{
  window.api.core.addFilter('test', value => `${value}+append1`);
  window.api.core.addFilter('test', value => `${value}+append2`);

  console.log(window.api.core.applyFilters('test', 'original'));
});