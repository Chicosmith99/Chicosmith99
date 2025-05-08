import React from 'react';

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-100 rounded shadow">
          <h3 className="text-lg font-medium">Total Flagged Comments</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h3 className="text-lg font-medium">Pending Review</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h3 className="text-lg font-medium">Auto-deleted</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
