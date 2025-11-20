 import { Alert } from 'react-native';

/**
 * Helper for development-only errors that should never occur in production.
 * Throws an error in dev, shows an alert in production.
 */
export function devError(message: string, err?: Error) {
  if (__DEV__) {
    throw err ?? new Error(message);
  } else {
    console.error(message, err);
    Alert.alert('Application Error', message + '\n\nPlease contact support.');
  }
}
