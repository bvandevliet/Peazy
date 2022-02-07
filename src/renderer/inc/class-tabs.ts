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
   * The amount of tabs, i.e. `li` elements.
   */
  get tabCount ()
  {
    return this.$ul.find('>li').length;
  }

  /**
   * The currently activated tab.
   */
  get activeTab ()
  {
    return this.$ul.find('>li.is-active').first() as JQuery<HTMLLIElement>;
  }

  constructor ()
  {
    this.$container = $(html.getTemplateClone('tmpl-tabs-container') as HTMLDivElement);
    this.$ul = this.$container.find('div.tabs>ul').first() as JQuery<HTMLUListElement>;
  }

  /**
   * Try trigger `onclick` on the first tab.
   */
  tryTriggerFirst ()
  {
    return this.$ul.find('>li>a').first().trigger('click') as JQuery<HTMLLIElement>;
  }

  /**
   * Try trigger `onclick` on the active tab.
   */
  tryTriggerActive ()
  {
    const $activeTab = this.activeTab;
    const $tabLink = $activeTab.find('>a').first();

    if ($tabLink.length > 0)
    {
      $tabLink.trigger('click');
      return $activeTab;
    }

    return this.tryTriggerFirst();
  }

  /**
   * Get an existing tab and its page.
   *
   * @param id The unique ID of the tab to find.
   *
   * @returns  An array consisting of the `li` tab and `div` page element.
   */
  getTabIfExists (id: tabItem['id']): [JQuery<HTMLLIElement>, JQuery<HTMLDivElement>]
  {
    id = window.api.core.sanitizeKey(id);

    return [
       this.$ul.find('>li').filter(function () { return $(this).attr('tab-id') === `tab-${id}`; }).first() as JQuery<HTMLLIElement>,
       this.$container.find('>div.wrapper-content').filter(function () { return $(this).attr('page-id') === `page-${id}`; }).first() as JQuery<HTMLDivElement>,
    ];
  }

  /**
   * Add a tab and page.
   *
   * @param id The unique ID of the tab to add.
   *
   * @returns  An array consisting of the `li` tab and `div` page element.
   */
  addTab (tab: tabItem, activate = true): [JQuery<HTMLLIElement>, JQuery<HTMLDivElement>]
  {
    tab.id = window.api.core.sanitizeKey(tab.id);

    if (this.getTabIfExists(tab.id).length > 0)
    {
      throw new Error(`A tab with ID "${tab.id}" already exists.`);
    }

    // Create a new tab element.
    const $li = (tab.template ? $(html.getTemplateClone(tab.template) as HTMLLIElement) : $(document.createElement('li')))
      .attr('tab-id', `tab-${tab.id}`)
      .addClass(tab.classes);

    // Create a new tab page element ..
    const $div = $(html.getTemplateClone('tmpl-tab-page') as HTMLDivElement).attr('page-id', `page-${tab.id}`);

    // .. and render its content.
    tab.script($div);

    // Then configure the link element.
    const $a = $(document.createElement('a'))
      .text(tab.text)
      .html(tab.html)
      .attr('title', tab.title)
      .on('click', e =>
      {
        e.preventDefault();

        this.$ul.find('>li').removeClass('is-active');
        this.$container.find('>div.wrapper-content').addClass('is-hidden');

        if (typeof tab.onclick === 'function')
        {
          tab.onclick($li, $div, e);
        }

        $li.addClass('is-active');
        $div.removeClass('is-hidden');
      })
      .appendTo($li);

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

        tab.oncontextmenu($li, $div, e);
      });
    }

    if (typeof tab.onmiddleclick === 'function')
    {
      $a.on('mousedown', e =>
      {
        e.preventDefault();

        if (e.button === 1) tab.onmiddleclick($li, $div, e);
      });
    }

    if (typeof tab.ondragstart === 'function')
    {
      $a
        .attr('draggable', 'true')
        .on('dragstart', e =>
        {
          e.preventDefault();

          tab.ondragstart($li, $div, e);
        });
    }

    this.$ul.append($li);
    this.$container.append($div);

    if (activate) $li.find('>a').first().trigger('click');

    return [$li, $div];
  }

  /**
   * Remove a tab and its page.
   *
   * @param id The unique ID of the tab to remove.
   */
  removeTab (id: tabItem['id'])
  {
    this.getTabIfExists(id).forEach($elem => $elem.remove());
  }
}