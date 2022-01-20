import * as fn from './inc/functions.js';

/**
 * Native File Drag & Drop example code.
 *
 * @link https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop
 */
document.getElementById('drag1').ondragstart = e =>
{
  e.preventDefault();
  window.api.startDrag('non-existing-file-1.md');
};
document.getElementById('drag2').ondragstart = e =>
{
  e.preventDefault();
  window.api.startDrag('non-existing-file-2.md');
};

/**
 * A filter example.
 */
fn.addFilter('test', value => { return `${value}+filter`; });
console.log(fn.applyFilters('test', 'apply'));