// import * as html from './inc/functions-html.js';

/**
 * Make sure to always copy plain text without styling.
 */
document.addEventListener('copy', e =>
{
  e.preventDefault();
  e.clipboardData.setData('text/plain', document.getSelection().toString());
});

/**
 * A filter example.
 */
window.addEventListener('DOMContentLoaded', () =>
{
  window.api.core.addFilter('test', value => `${value}+append1`);
  window.api.core.addFilter('test', value => `${value}+append2`);

  console.log(window.api.core.applyFilters('test', 'original'));
});