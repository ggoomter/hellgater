import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from './store/store';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Login, Register, Home, CharacterCreate, Map, StageDetail } from './pages';
import WorkoutRecord from './pages/WorkoutRecord';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}
        persistor={persistor}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
          <Routes>
            {/* Public routes - 로그인하지 않은 사용자만 접근 가능 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - 로그인한 사용자만 접근 가능 */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Root redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/character/create"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <CharacterCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <Map />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map/:attribute/:chapterId/:stageId"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <StageDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/record"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/login">
                  <WorkoutRecord />
                </ProtectedRoute>
              }
            />

            {/* Catch all - 404 redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
