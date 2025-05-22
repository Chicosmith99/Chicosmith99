import React, { useState, useEffect } from 'react';
import WhitelistManager from './components/WhitelistManager';
import FlaggedComments from './components/FlaggedComments';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Keywords from './components/Keywords';
import Settings from './components/Settings';
import Analytics from './components/Analytics';
import BlockedAccounts from './components/BlockedAccounts';
import NotificationManager from './components/NotificationManager.jsx';
import SpamRuleManager from './components/SpamRuleManager.jsx';
import ModerationWorkflow from './components/ModerationWorkflow.jsx';
import logo from '../icons/City of Jesus Ministry Logo.png';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [badgeCounts, setBadgeCounts] = useState({
    flagged: 0,
    whitelist: 0,
    blocked: 0,
    keywords: 0,
  });

  // Placeholder effect to simulate badge count updates
  useEffect(() => {
    // In real implementation, fetch counts from storage or context
    async function fetchBadgeCounts() {
      // Example: fetch flagged comments count
      // For now, static values
      setBadgeCounts({
        flagged: 3,
        whitelist: 1,
        blocked: 2,
        keywords: 0,
      });
    }
    fetchBadgeCounts();
  }, []);

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
      case 'blocked':
        return <BlockedAccounts />;
      case 'settings':
        return <Settings />;
      case 'analytics':
        return <Analytics />;
      case 'notifications':
        return <NotificationManager />;
      case 'spamrules':
        return <SpamRuleManager />;
      case 'moderation':
        return <ModerationWorkflow />;
      default:
        return <Dashboard />;
    }
  };

  const renderTabButton = (tabKey, label) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`w-full text-left p-2 hover:bg-gray-300 rounded flex justify-between items-center ${
        activeTab === tabKey ? 'bg-gray-300 font-semibold' : ''
      }`}
    >
      <span>{label}</span>
      {badgeCounts[tabKey] > 0 && (
        <span className="bg-red-600 text-white rounded-full px-2 text-xs font-bold">
          {badgeCounts[tabKey]}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex h-full w-full" style={{ backgroundImage: `url(${logo})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain' }}>
      <nav className="w-56 bg-gray-100 p-4">
        <h1 className="text-xl font-bold mb-6">COJIM Security</h1>
        <ul>
          <li>{renderTabButton('dashboard', 'Dashboard')}</li>
          <li>{renderTabButton('flagged', 'Flagged Comments')}</li>
          <li>{renderTabButton('reports', 'Reports')}</li>
          <li>{renderTabButton('whitelist', 'Whitelist')}</li>
          <li>{renderTabButton('blocked', 'Blocked Accounts')}</li>
          <li>{renderTabButton('keywords', 'Keywords')}</li>
          <li>{renderTabButton('settings', 'Settings')}</li>
          <li>{renderTabButton('analytics', 'Analytics')}</li>
          <li>{renderTabButton('notifications', 'Notifications')}</li>
          <li>{renderTabButton('spamrules', 'Spam Rule Management')}</li>
          <li>{renderTabButton('moderation', 'Moderation')}</li>
        </ul>
      </nav>
      <main className="flex-grow p-4 overflow-auto">{renderTabContent()}</main>
    </div>
  );
}

