import React, { useState } from 'react';

function Reports() {
  const [reportType, setReportType] = useState('flaggedComments');

  const generateReport = () => {
    // Placeholder for report generation logic
    alert(`Generating ${reportType} report...`);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Exportable Reports</h2>
      <div className="mb-4">
        <label htmlFor="reportType" className="block mb-2 font-medium">Select Report Type:</label>
        <select
          id="reportType"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="border border-gray-300 rounded p-2"
        >
          <option value="flaggedComments">Flagged Comments</option>
          <option value="moderationActions">Moderation Actions</option>
          <option value="userAnalytics">User Analytics</option>
        </select>
      </div>
      <button
        onClick={generateReport}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Report
      </button>
    </div>
  );
}

export default Reports;
