import * as core from './functions-core';

/**
 * Sanitize a string for use in SQL.
 *
 * @param input   The input string.
 * @param escLike Escape LIKE wildcards?
 */
export const sanitizeSql = (input: string, escLike = false) =>
{
  input = (input ?? '').replace(/(')/giu, '\'$1');
  return escLike ? input.replace(/([%_[])/giu, '\\$1') : input;
};

/**
 * Sanitize a value for use in SQL.
 *
 * @param input   The input value.
 * @param escLike Escape LIKE wildcards?
 */
export const sanitizeSqlValue = (input: any, escLike = false) =>
{
  if (core.isEmpty(input))
  {
    return 'NULL';
  }

  switch (typeof input)
  {
    case 'boolean':
      return input ? '1' : '0';
    case 'number':
      return input;
    default:
      return !isNaN(input) ? parseFloat(input) : `'${sanitizeSql(input, escLike)}'`;
  }
};

/**
 * Client-side alternative to the sql JOIN clause.
 *
 * This can be useful in case we need to combine datasets from different sources.
 *
 * @param tableJoin The recordset to JOIN.
 * @param tableMain The main recordset.
 * @param lookupKey The key in the lookup records to join ON.
 * @param mainKey   The key in the main records to join ON.
 *
 * @link http://learnjsdata.com/combine_data.html
 *
 * @returns Combined recordset.
 */
export const join = (tableJoin: Record<string, any>[], tableMain: Record<string, any>[], lookupKey: string, mainKey: string) =>
{
  const
    lookupIndex: Record<any, Record<string, any>> = {},
    lengthMain = tableMain.length,
    lengthLookup = tableJoin.length;

  // Create a record collection indexed by the lookup value.
  for (let i = 0; i < lengthLookup; i++)
  {
    const recordLookup = tableJoin[i];

    if (!core.isEmpty(recordLookup[lookupKey]))
    {
      lookupIndex[recordLookup[lookupKey]] = recordLookup;
    }
  }

  // Find the associated lookup record for each main record and merge them together.
  for (let i = 0; i < lengthMain; i++)
  {
    const recordMain = tableMain[i];

    if (!core.isEmpty(lookupIndex[recordMain[mainKey]]))
    {
      const recordLookup = lookupIndex[recordMain[mainKey]];

      tableMain[i] = core.parseArgs(recordMain, recordLookup);
    }
  }

  // Combined recordset.
  return tableMain;
};