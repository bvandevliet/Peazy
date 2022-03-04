import * as html from './functions-html.js';

/**
 * A wrapper class to handle html for tabs.
 */
export default class Tabs
{
  /**
   * The html container `div` element.
   * This is the element you want to add to the DOM.
   */
  readonly $container: JQuery<HTMLDivElement>;

  /**
   * The html tabs list.
   */
  readonly $ul: JQuery<HTMLUListElement>;

  /**
   * Is drag & drop sortable?
   */
  readonly sortable;

  /**
   * The currently being dragged `li` element.
   */
  private _dragging: HTMLLIElement = null;

  /**
   * The amount of tabs, i.e. `li` elements.
   */
  get tabCount ()
  {
    return this.$ul.find('>li').length;
  }

  /**
   * The currently activated tab and page element.
   */
  get activeTab ()
  {
    const $li = this.$ul.find('>li.is-active').first() as JQuery<HTMLLIElement>;
    const id = $li.attr('tab-id');

    return {
      $li: $li,
      $div: this.$container.find('>div.wrapper-content').filter(function () { return $(this).attr('tab-id') === id; }).first() as JQuery<HTMLDivElement>,
    };
  }

  /**
   *
   * @param sortable Enable drag & drop sorting? Default is `false`.
   */
  constructor (sortable = false)
  {
    this.sortable = sortable;

    this.$container = $(html.getTemplateClone('tmpl-tabs-container') as HTMLDivElement);
    this.$ul = this.$container.find('div.tabs>ul').first() as JQuery<HTMLUListElement>;
  }

  /**
   * Get an existing tab and its page.
   *
   * @param id The unique ID of the tab to find.
   */
  getTabIfExists (id: tabItem['id'])
  {
    id = window.api.core.sanitizeKey(id);

    return {
      $li: this.$ul.find('>li').filter(function () { return $(this).attr('tab-id') === id; }).first() as JQuery<HTMLLIElement>,
      $div: this.$container.find('>div.wrapper-content').filter(function () { return $(this).attr('tab-id') === id; }).first() as JQuery<HTMLDivElement>,
    };
  }

  /**
   * Try trigger `onclick` on an existing tab.
   *
   * @param id The unique ID of the tab to find.
   */
  tryTrigger (id: tabItem['id'])
  {
    const { $li, $div } = this.getTabIfExists(id);

    let _promise: ReturnType<tabItem['onclick']> = null;

    $li.find('>a').first().trigger('click', [(promise: ReturnType<tabItem['onclick']>) => _promise = promise]);

    return { $li: $li, $div: $div, promise: _promise ?? new Promise(resolve => resolve(false)) };
  }

  /**
   * Try trigger `onclick` on the first tab.
   */
  tryTriggerFirst ()
  {
    const $li = this.$ul.find('>li').first() as JQuery<HTMLLIElement>;
    const id = $li.attr('tab-id');

    let _promise: ReturnType<tabItem['onclick']> = null;

    $li.find('>a').first().trigger('click', [(promise: ReturnType<tabItem['onclick']>) => _promise = promise]);

    return {
      $li: $li,
      $div: this.$container.find('>div.wrapper-content').filter(function () { return $(this).attr('tab-id') === id; }).first() as JQuery<HTMLDivElement>,
      promise: _promise ?? new Promise(resolve => resolve(false)),
    };
  }

  /**
   * Try trigger `onclick` on the active tab.
   */
  tryTriggerActive ()
  {
    const { $li, $div } = this.activeTab;

    let _promise: ReturnType<tabItem['onclick']> = null;

    $li.find('>a').first().trigger('click', [(promise: ReturnType<tabItem['onclick']>) => _promise = promise]);

    return { $li: $li, $div: $div, promise: _promise ?? new Promise(resolve => resolve(false)) };
  }

  /**
   * Add a tab and page.
   *
   * @param tab      The tab item to add.
   * @param activate Whether to activate the tab. Default is `true`.
   */
  addTab (tab: tabItem, activate = true)
  {
    tab.id = window.api.core.sanitizeKey(tab.id);

    // Activate existing tab instead if any.
    let { $li, $div } = this.getTabIfExists(tab.id);
    if ($li.length)
    {
      $li.find('>a').first().trigger('click');

      return { $li: $li, $div: $div };
    }

    // Create a new tab element.
    $li = (tab.template ? $(html.getTemplateClone(tab.template) as HTMLLIElement) : $(document.createElement('li')))
      .attr('tab-id', `${tab.id}`)
      .addClass(tab.classes)
      .attr('draggable', `${this.sortable}`);

    // Create a new tab page element ..
    $div = $(html.getTemplateClone('tmpl-tab-page') as HTMLDivElement).attr('tab-id', tab.id);

    // .. and render its content.
    tab.callback($div, $li);

    const activateTab = () =>
    {
      this.$ul.find('>li').removeClass('is-active');
      this.$container.find('>div.wrapper-content').addClass('is-hidden');

      $li.addClass('is-active');
      $div.removeClass('is-hidden');
    };

    // Then configure the link element.
    let $a = $li.find('>a');
    $a = ($a.length
      ? $a.first() as JQuery<HTMLAnchorElement>
      : $(document.createElement('a')).prependTo($li))
      .text(tab.text)
      .html(tab.html)
      .attr('title', tab.title)
      .on('click', (e, callback?: (promise: ReturnType<tabItem['onclick']>) => void) =>
      {
        // e.preventDefault();

        if (typeof tab.onclick === 'function')
        {
          // eslint-disable-next-line no-shadow
          const promise = tab.onclick($li, $div, e).then(activate => activate ? (activateTab(), true) : false);

          if (typeof callback === 'function') callback(promise);
        }
      })
      .attr('draggable', 'false'); // to allow dragging the underlying `li` element

    // Render as disabled.
    if (typeof tab.onclick !== 'function') $li.css('opacity', '.6');

    if (typeof tab.ondblclick === 'function')
    {
      $a.on('dblclick', e =>
      {
        e.preventDefault();

        tab.ondblclick($li, $div, e);
      });
    }

    if (typeof tab.oncontextmenu === 'function')
    {
      $a.on('contextmenu', e =>
      {
        e.preventDefault();

        window.api.core.contextMenu(tab.oncontextmenu($li, $div, e));
      });
    }

    if (typeof tab.onmiddleclick === 'function')
    {
      $a.on('mousedown', e =>
      {
        if (e.button === 1) { e.preventDefault(); tab.onmiddleclick($li, $div, e); }
      });
    }

    if (this.sortable)
    {
      $li
        .on('dragstart', e =>
        {
          e.originalEvent.dataTransfer.effectAllowed = 'move';

          this._dragging = e.delegateTarget;
        })
        .on('dragend', () =>
        {
          this._dragging = null;
        })
        .on('dragover', e =>
        {
          e.preventDefault();

          if (this._dragging) e.originalEvent.dataTransfer.dropEffect = 'move';
        })
        .on('dragenter', e =>
        {
          const $target = $(e.delegateTarget);

          if ($target.nextAll().index(this._dragging) >= 0)
          {
            $target.before(this._dragging);
          }
          else if (!$target.is(this._dragging))
          {
            $target.after(this._dragging);
          }
        });
    }

    this.$ul.append($li);
    this.$container.append($div);

    if (activate) activateTab();

    return { $li: $li, $div: $div };
  }

  /**
   * Remove a tab and its page.
   *
   * @param id The unique ID of the tab to remove.
   */
  removeTab (id: tabItem['id'] | JQuery<HTMLLIElement> | JQuery<HTMLDivElement>)
  {
    if (typeof id !== 'string') id = id.attr('tab-id');

    for (const $elem of Object.values(this.getTabIfExists(id))) $elem.remove();
  }
}