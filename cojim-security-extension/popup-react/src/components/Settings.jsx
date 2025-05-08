import React, { useEffect, useState } from 'react';

function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setDarkMode(savedTheme === 'dark');
    document.documentElement.className = savedTheme;
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.className = newMode ? 'dark' : 'light';
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <label className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          checked={darkMode}
          onChange={toggleDarkMode}
          className="form-checkbox"
        />
        <span>Dark Mode</span>
      </label>
      <p>Other settings will appear here.</p>
    </div>
  );
}

export default Settings;
