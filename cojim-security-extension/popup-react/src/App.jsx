import React, { useState } from 'react';
import WhitelistManager from './components/WhitelistManager';
import FlaggedComments from './components/FlaggedComments';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Keywords from './components/Keywords';
import Settings from './components/Settings';
import Analytics from './components/Analytics';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'flagged':
        return <FlaggedComments />;
      case 'reports':
        return <Reports />;
      case 'whitelist':
        return <WhitelistManager />;
      case 'keywords':
        return <Keywords />;
      case 'settings':
        return <Settings />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-full w-full">
      <nav className="w-56 bg-gray-100 p-4">
        <h1 className="text-xl font-bold mb-6">COJIM Security</h1>
        <ul>
          <li><button onClick={() => setActiveTab('dashboard')} className="w-full text-left p-2 hover:bg-gray-300 rounded">Dashboard</button></li>
          <li><button onClick={() => setActiveTab('flagged')} className="w-full text-left p-2 hover:bg-gray-300 rounded">Flagged Comments</button></li>
          <li><button onClick={() => setActiveTab('reports')} className="w-full text-left p-2 hover:bg-gray-300 rounded">Reports</button></li>
          <li><button onClick={() => setActiveTab('whitelist')} className="w-full text-left p-2 hover:bg-gray-300 rounded">Whitelist</button></li>
          <li><button onClick={() => setActiveTab('keywords')} className="w-full text-left p-2 hover:bg-gray-300 rounded">Keywords</button></li>
          <li><button onClick={() => setActiveTab('settings')} className="w-full text-left p-2 hover:bg-gray-300 rounded">Settings</button></li>
          <li><button onClick={() => setActiveTab('analytics')} className="w-full text-left p-2 hover:bg-gray-300 rounded">Analytics</button></li>
        </ul>
      </nav>
      <main className="flex-grow p-4 overflow-auto">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App;
