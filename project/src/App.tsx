import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Rooms from './pages/Rooms';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  // Map page IDs to titles
  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    tenants: 'Tenants Management',
    rooms: 'Room Management',
    payments: 'Payment Records',
    maintenance: 'Maintenance Requests',
    reports: 'Financial Reports',
    notifications: 'Notifications',
    settings: 'System Settings'
  };

  // Render active page based on state
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'tenants':
        return <Tenants />;
      case 'rooms':
        return <Rooms />;
      case 'payments':
        return <Payments />;
      case 'maintenance':
        return <Maintenance />;
      case 'reports':
        return <Reports />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <div className="p-6">Page under construction</div>;
    }
  };

  return (
    <Layout 
      title={pageTitles[activePage]} 
      activeItem={activePage}
      onNavigate={setActivePage}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;