/**
 * Class to handle date and time in a convenient manner.
 */
export default class DateTime
{
  /**
   * The underlying Date object.
   */
  public Date: Date;

  /**
   *
   * @param TimeStringOrStamp A specific date/time to create instance with.
   */
  constructor (TimeStringOrStamp: string | number | Date = Date.now())
  {
    this.Date = new Date(TimeStringOrStamp);
  }

  /**
   * Sort an array of `Date` objects.
   *
   * @param dateList Array of `Date` objects to sort.
   */
  static sort (dateList: Date[], order: Order = 'ASC')
  {
    return order !== 'DESC'
      ? dateList.sort((a, b) => a.getTime() - b.getTime())
      : dateList.sort((b, a) => a.getTime() - b.getTime());
  }

  /**
   * Get the earliest `Date` object in an array of `Date` objects.
   *
   * @param dateList Array of `Date` objects to sort.
   */
  static earliest (dateList: Date[])
  {
    return this.sort(dateList, 'ASC')[0];
  }

  /**
   * Get the latest `Date` object in an array of `Date` objects.
   *
   * @param dateList Array of `Date` objects to sort.
   */
  static latest (dateList: Date[])
  {
    return this.sort(dateList, 'DESC')[0];
  }

  /**
   * Returns the year (4 digits for 4-digit years) according to local time.
   */
  getFullYear ()
  {
    return this.Date.getFullYear();
  }

  /**
   * Returns the month (01~12) according to local time.
   */
  getMonth ()
  {
    return (this.Date.getMonth() + 1).toString().padStart(2, '0');
  }

  /**
   * Returns the day of the month (01~31) according to local time.
   */
  getDay ()
  {
    return this.Date.getDate().toString().padStart(2, '0');
  }

  /**
   * Returns the hour (00~23) according to local time.
   */
  getHours ()
  {
    return this.Date.getHours().toString().padStart(2, '0');
  }

  /**
   * Returns the minutes (00~59) according to local time.
   */
  getMinutes ()
  {
    return this.Date.getMinutes().toString().padStart(2, '0');
  }

  /**
   * Returns the seconds (00~59) according to local time.
   */
  getSeconds ()
  {
    return this.Date.getSeconds().toString().padStart(2, '0');
  }

  /**
   * Returns the date (yyyy/MM) according to local time.
   *
   * @param separator Delimiter to user in between the date segments.
   */
  getYearMonth (separator = '/')
  {
    return this.getFullYear() + separator + this.getMonth();
  }

  /**
   * Returns the date (yyyy/MM/dd) according to local time.
   *
   * @param separator Delimiter to user in between the date segments.
   */
  getDate (separator = '/')
  {
    return this.getFullYear() + separator + this.getMonth() + separator + this.getDay();
  }

  /**
   * Returns the date (yyyy-MM-dd) according to local time.
   */
  getDateFileSys ()
  {
    return this.getDate('-');
  }

  /**
   * Returns the time (HH:mm) according to local time.
   */
  getTime ()
  {
    return `${this.getHours()}:${this.getMinutes()}`;
  }

  /**
   * Returns the time (HH:mm:ss) according to local time.
   */
  getFullTime ()
  {
    return `${this.getHours()}:${this.getMinutes()}:${this.getSeconds()}`;
  }

  /**
   * Returns a timestamp (yyyy/MM/dd HH:mm:ss) according to local time.
   *
   * @param separator Delimiter to user in between the date segments.
   */
  getTimestamp (separator = '/')
  {
    return `${this.getDate(separator)} ${this.getFullTime()}`;
  }
}