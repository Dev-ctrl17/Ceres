import '@/styles/globals.css';
import { AuthProvider } from '../src/contexts/AuthContext';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Component {...pageProps} />
      </ProtectedRoute>
      <Toaster />
    </AuthProvider>
  );
}