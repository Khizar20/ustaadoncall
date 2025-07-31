import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, MapPin } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Map Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Failed to load map</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  There was an error loading the interactive map. This could be due to network issues or Google Maps API problems.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button 
                  onClick={this.handleRetry}
                  variant="default"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>

              {this.state.error && (
                <details className="text-xs text-muted-foreground max-w-md mx-auto">
                  <summary className="cursor-pointer hover:text-foreground">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
} 