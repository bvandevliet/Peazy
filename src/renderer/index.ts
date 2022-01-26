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
 * Toggle browsing state on key input.
 */
document.addEventListener('keyup', e =>
{
  if (e.ctrlKey && e.shiftKey && e.key === 'F')
  {
    $(document.body).addClass('browsing');
    // setTimeout(() => { $project_search[0].focus(); });
  }
  else if (e.key === 'Escape')
  {
    $(document.body).removeClass('browsing');
    // setTimeout(() => { $project_search[0].blur(); });
  }
});

/**
 * Toggle browsing state on sidebar mouse input.
 */
$('#sidebar').on('mouseup', function (e)
{
  // Remove browsing state for links that open a main tab.
  if ($(e.target).is('a.opens-main-tab'))
  {
    $(document.body).removeClass('browsing');
  }
  // Taking care of scrollbar.
  else if (e.clientX < this.clientWidth - 18)
  {
    $(document.body).addClass('browsing');
  }
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