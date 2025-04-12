import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TooltipProvider } from './components/ui/tooltip';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Index';
import Profile from './pages/Profile';
import Events from './pages/Events';
import Budget from './pages/Budget';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import EventForm from './pages/EventForm';
import Calendar from './pages/Calendar';
import EventDetail from './pages/EventDetail';
import { setupDataListeners } from './services';

// Create a fresh QueryClient instance with minimal configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: true,
    },
  }
});

// Define types for ErrorBoundary
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Create an error boundary component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to console
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-4">{this.state.error?.toString()}</p>
          <pre className="bg-gray-100 p-4 rounded text-left overflow-auto max-w-full max-h-80 mb-4">
            {this.state.errorInfo?.componentStack}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Data listener component that sets up real-time listeners
const DataListeners: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  useEffect(() => {
    let cleanup: () => void = () => {};
    
    if (user) {
      cleanup = setupDataListeners(user.id);
    }
    
    return () => {
      cleanup();
    };
  }, [user]);
  
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <TooltipProvider>
                <DataListeners>
                  <Toaster position="top-right" richColors closeButton />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={
                        <Suspense fallback={<div>Loading dashboard...</div>}>
                          <Dashboard />
                        </Suspense>
                      } />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/new" element={<EventForm />} />
                      <Route path="/events/:id" element={<EventDetail />} />
                      <Route path="/events/:id/edit" element={<EventForm />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/calendar/day/:year/:month/:day" element={<Events />} />
                      <Route path="/budget" element={<Budget />} />
                      <Route path="/analytics" element={<Analytics />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DataListeners>
              </TooltipProvider>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
