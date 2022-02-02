// import * as html from './inc/functions-html.js';

/**
 * Prevent default 'dragover' and 'drop' behaviour.
 */
document.addEventListener('dragover drop', e =>
  (e.preventDefault(), e.stopPropagation(), false));

/**
 * Make sure to always copy plain text without styling.
 */
document.addEventListener('copy', e =>
  (e.preventDefault(), e.clipboardData.setData('text/plain', document.getSelection().toString())));

/**
 * A filter example.
 */
window.addEventListener('DOMContentLoaded', () =>
{
  window.api.core.addFilter('test', value => `${value}+append1`);
  window.api.core.addFilter('test', value => `${value}+append2`);

  console.log(window.api.core.applyFilters('test', 'original'));
});