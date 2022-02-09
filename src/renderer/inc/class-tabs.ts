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
   * The currently activated tab and page element.
   */
  get activeTab (): [JQuery<HTMLLIElement>, JQuery<HTMLDivElement>]
  {
    const $li = this.$ul.find('>li.is-active').first() as JQuery<HTMLLIElement>;
    const id = $li.attr('tab-id');

    return [
      $li,
      this.$container.find('>div.wrapper-content').filter(function () { return $(this).attr('tab-id') === id; }).first() as JQuery<HTMLDivElement>,
    ];
  }

  constructor ()
  {
    this.$container = $(html.getTemplateClone('tmpl-tabs-container') as HTMLDivElement);
    this.$ul = this.$container.find('div.tabs>ul').first() as JQuery<HTMLUListElement>;
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
      this.$ul.find('>li').filter(function () { return $(this).attr('tab-id') === id; }).first() as JQuery<HTMLLIElement>,
      this.$container.find('>div.wrapper-content').filter(function () { return $(this).attr('tab-id') === id; }).first() as JQuery<HTMLDivElement>,
    ];
  }

  /**
   * Try trigger `onclick` on an existing tab.
   *
   * @param id The unique ID of the tab to find.
   *
   * @returns  An array consisting of the `li` tab and `div` page element.
   */
  tryTrigger (id: tabItem['id']): [JQuery<HTMLLIElement>, JQuery<HTMLDivElement>]
  {
    const [$li, $div] = this.getTabIfExists(id);

    $li.find('>a').first().trigger('click');

    return [$li, $div];
  }

  /**
   * Try trigger `onclick` on the first tab.
   *
   * @returns  An array consisting of the `li` tab and `div` page element.
   */
  tryTriggerFirst (): [JQuery<HTMLLIElement>, JQuery<HTMLDivElement>]
  {
    const $li = this.$ul.find('>li').first() as JQuery<HTMLLIElement>;
    const id = $li.attr('tab-id');

    $li.find('>a').first().trigger('click');

    return [
      $li,
      this.$container.find('>div.wrapper-content').filter(function () { return $(this).attr('tab-id') === id; }).first() as JQuery<HTMLDivElement>,
    ];
  }

  /**
   * Try trigger `onclick` on the active tab.
   *
   * @returns  An array consisting of the `li` tab and `div` page element.
   */
  tryTriggerActive (): [JQuery<HTMLLIElement>, JQuery<HTMLDivElement>]
  {
    const [$li, $div] = this.activeTab;

    $li.find('>a').first().trigger('click');

    return [$li, $div];
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

    // Activate existing tab instead if any.
    const [$liExisting, $divExisting] = this.getTabIfExists(tab.id);
    if ($liExisting.length > 0)
    {
      $liExisting.find('>a').first().trigger('click');

      return [$liExisting, $divExisting];
    }

    // Create a new tab element.
    const $li = (tab.template ? $(html.getTemplateClone(tab.template) as HTMLLIElement) : $(document.createElement('li')))
      .attr('tab-id', `${tab.id}`)
      .addClass(tab.classes);

    // Create a new tab page element ..
    const $div = $(html.getTemplateClone('tmpl-tab-page') as HTMLDivElement).attr('tab-id', tab.id);

    // .. and render its content.
    tab.callback($div);

    const activateTab = () =>
    {
      this.$ul.find('>li').removeClass('is-active');
      this.$container.find('>div.wrapper-content').addClass('is-hidden');

      $li.addClass('is-active');
      $div.removeClass('is-hidden');
    };

    // Then configure the link element.
    let $a = $li.find('>a') as JQuery<HTMLAnchorElement>;
    $a = ($a.length > 0 ? $a.first() : $(document.createElement('a')).prependTo($li))
      .text(tab.text)
      .html(tab.html)
      .attr('title', tab.title)
      .on('click', e =>
      {
        e.preventDefault();

        activateTab();

        if (typeof tab.onclick === 'function')
        {
          tab.onclick($li, $div, e);
        }
      });

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

    if (activate) activateTab();

    return [$li, $div];
  }

  /**
   * Remove a tab and its page.
   *
   * @param id The unique ID of the tab to remove.
   */
  removeTab (id: tabItem['id'] | JQuery<HTMLLIElement> | JQuery<HTMLDivElement>)
  {
    if (typeof id !== 'string') id = id.attr('tab-id');

    this.getTabIfExists(id).forEach($elem => $elem.remove());
  }
}