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