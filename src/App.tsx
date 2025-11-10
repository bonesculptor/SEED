import { useState } from 'react';
import { ProtocolDashboard } from './components/ProtocolDashboard';
import PersonalMedicalRecordManager from './components/PersonalMedicalRecordManager';
import EnhancedMedicalGraph from './components/EnhancedMedicalGraph';
import { Dashboard } from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const pathname = window.location.pathname;

  if (pathname === '/medical-records') {
    return (
      <ErrorBoundary>
        <PersonalMedicalRecordManager />
      </ErrorBoundary>
    );
  }

  if (pathname === '/medical-graph') {
    return (
      <ErrorBoundary>
        <EnhancedMedicalGraph />
      </ErrorBoundary>
    );
  }

  if (pathname === '/protocols') {
    return (
      <ErrorBoundary>
        <ProtocolDashboard />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

export default App;
