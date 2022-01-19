import { API } from '../main/preload';

/**
 * Provides types and intellisense for the ContextBridge APIs.
 */
declare global
{
  // eslint-disable-next-line no-shadow
  interface Window
  {
    api: typeof API,
  }
}