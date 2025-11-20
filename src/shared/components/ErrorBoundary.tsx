import React, { ErrorInfo, ReactNode } from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Potentially send to a logging service like Sentry, Bugsnag, etc.
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong.</Text>
          <Text style={styles.message}>
            We're sorry, an unexpected error occurred. Please try again later.
          </Text>
          {this.state.error && (
            <Text style={styles.errorDetails}>
              Error: {this.state.error.message}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8d7da', // Light red background for error
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#721c24', // Dark red text
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#721c24',
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#721c24',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;