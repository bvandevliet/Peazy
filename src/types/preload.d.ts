import { API } from '../main/preload';

/**
 * Provides types and intellisense for the ContextBridge APIs.
 */
declare global
{
  // eslint-disable-next-line no-shadow
  interface Window
  {
    /**
     * The ContextBridge API.
     */
    api: typeof API;

    /**
     * Only available if `--expose-gc` is passed to the process.
     */
    gc: undefined | (() => void);
  }
}