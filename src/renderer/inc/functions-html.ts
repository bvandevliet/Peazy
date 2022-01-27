/**
 * Copy a string to the clipboard.
 *
 * @param text The text to copy.
 */
export const copyText = (text: string) =>
{
  navigator.clipboard.writeText(text);
};

/**
 * Get a html template node by ID.
 *
 * @param id The ID of the template to get.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
 */
export const getTemplate = (id: string) =>
  (document.getElementById(id) as HTMLTemplateElement).content.firstElementChild.cloneNode(true);

// eslint-disable-next-line no-shadow
export enum Order
{
  ASC,
  DESC,
}

/**
 * Sort elements alphabetically and numerically.
 *
 * @param elemSet The set of elements to sort.
 * @param sortBy  Callback function to return a value to sort by.
 * @param orderBy Sort order. Default is `ASC`.
 */
export const sortElement =
(
  elemSet: any,
  sortBy: (curElem: HTMLElement) => string|number,
  orderBy: Order = Order.ASC,
) =>
{
  const doSort = (a: HTMLElement, b: HTMLElement) =>
  {
    const textA = sortBy(a).toString().trim();
    const textB = sortBy(b).toString().trim();

    return textA.localeCompare(textB, undefined, { numeric: true, sensitivity: 'base' });
  };

  $(elemSet).toArray()
    .sort((a, b) => orderBy === Order.DESC ? doSort(b, a) : doSort(a, b))
    .forEach(curElem => $(curElem).parent().append(curElem));
};