import React, { useEffect, useState } from 'react';
import { getAllUserBehaviorData, analyzeUserBehavior } from '../../utils/analytics.js';

function Analytics() {
  const [userData, setUserData] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});

  useEffect(() => {
    async function fetchData() {
      const data = await getAllUserBehaviorData();
      setUserData(data);

      const results = {};
      for (const userId of Object.keys(data)) {
        results[userId] = await analyzeUserBehavior(userId);
      }
      setAnalysisResults(results);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">User Behavior Analytics</h2>
      {Object.keys(userData).length === 0 ? (
        <p>No user behavior data available.</p>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">User ID</th>
              <th className="border border-gray-300 px-4 py-2">Flagged Count</th>
              <th className="border border-gray-300 px-4 py-2">Suspicious</th>
              <th className="border border-gray-300 px-4 py-2">Reasons</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(userData).map(([userId, data]) => (
              <tr key={userId}>
                <td className="border border-gray-300 px-4 py-2">{userId}</td>
                <td className="border border-gray-300 px-4 py-2">{data.flaggedCount}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {analysisResults[userId]?.suspicious ? 'Yes' : 'No'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {analysisResults[userId]?.reasons.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Analytics;
