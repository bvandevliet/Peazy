/**
 * Class for filtering elements by a search query.
 */
export default class Search
{
  /**
   * The container element that is a close parent of the `elemSelector` selector.
   */
  public $elemMaster: JQuery<HTMLElement>;

  /**
   * The selector string that refers to the elements to show/hide relative to `elemMaster`.
   */
  public elemSelector: string;

  /**
   * The callback function to return a value to search in.
   */
  public searchIn: (curElem: HTMLElement) => string | string[];

  /**
   * Internal search timeout timer.
   */
  private _timer: NodeJS.Timeout;

  /**
   *
   * @param elemMaster   A container element that is a close parent of the `elemSelector` selector.
   * @param elemSelector A selector string that refers to the elements to show/hide relative to `elemMaster`.
   * @param searchIn     A callback function to return a value to search in.
   */
  constructor
  (
    elemMaster: any,
    elemSelector: string,
    searchIn: (curElem: HTMLElement) => string | string[],
  )
  {
    this.$elemMaster = $(elemMaster);
    this.elemSelector = elemSelector;
    this.searchIn = searchIn;
  }

  /**
   * Split a string or string array by whitespaces and flatten it.
   *
   * @param input String or string array to split and flatten.
   */
  static flatten (input: string | string[])
  {
    return (!Array.isArray(input) ? [input] : input).flatMap(str => str.replace(/\s+/gu, ' ').trim().split(' '));
  }

  /**
   * Test if a string contains a substring, ignoring diacritics.
   *
   * @param haystack
   * @param needle
   */
  static includes (haystack: string, needle: string)
  {
    const decomposedA = haystack.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase();
    const decomposedB = needle.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase();

    return decomposedA.includes(decomposedB);
  }

  /**
   * Test if a search array matches a search query.
   *
   * @param searchIn  String or array to search in.
   * @param searchFor String or array of search queries.
   *                  These can contain negative queries starting with `!`
   *                  and (negative) regex queries starting with `(!)^`.
   */
  static isMatch (searchIn: string | string[], searchFor: string | string[])
  {
    searchIn = Search.flatten(searchIn);
    searchFor = Search.flatten(searchFor);

    return searchFor.every(queryItem =>
    {
      const negative = queryItem.startsWith('!');

      if (negative)
      {
        queryItem = queryItem.substring(1);
      }

      let queryRegex: RegExp = null;

      if (queryItem.startsWith('^'))
      {
        queryItem = queryItem.substring(1);

        try
        {
          queryRegex = new RegExp(queryItem, 'iu');
        }
        catch (err)
        {
          return false;
        }
      }

      // Does every positive query item match at least one search item?
      // And does every negative query segment not match any search segment?
      return !queryItem.length || negative !== (searchIn as string[]).some(searchItem =>
        queryRegex ? queryRegex.test(searchItem) : Search.includes(searchItem, queryItem));
    });
  }

  /**
   * Perform a search action on this instance.
   *
   * @param queryStr The search query string.
   * @param blurOnly When `true`, the element will not be hidden
   */
  search (queryStr: string, blurOnly = false)
  {
    clearTimeout(this._timer);
    this._timer = setTimeout(() =>
    {
      const $elemSet = this.$elemMaster.find(this.elemSelector);

      if (!queryStr.trim().length)
      {
        $elemSet.removeClass(['is-hidden', 'is-blurred']); return;
      }

      // Loop through each parent element and show/hide it based on search query matching.
      $elemSet.each((_i, elemParent) =>
      {
        const $elemParent = $(elemParent);

        if ($elemParent.hasClass('ignore-search')) return;

        const searchArr = this.searchIn(elemParent);

        if (Search.isMatch(searchArr, queryStr))
        {
          $elemParent.removeClass(['is-hidden', 'is-blurred']);
        }
        else
        {
          blurOnly ? $elemParent.addClass('is-blurred') : $elemParent.addClass('is-hidden');
        }
      });
    },
    200);
  }
}