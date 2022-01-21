import { Hook } from '../inc/class-hook';

/**
 * Provides types and intellisense for the ContextBridge APIs.
 */
declare global
{
  // eslint-disable-next-line no-shadow
  interface Window
  {
    filters: Record<string, Hook>,
  }
}