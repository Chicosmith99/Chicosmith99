import { getStorage } from './storage.js';

export async function calculateRiskScore() {
  const comments = await getStorage('flaggedComments') || [];
  const liveStreams = await getStorage('flaggedLiveStreams') || [];
  const uploads = await getStorage('flaggedUploadPosts') || [];

  let score = 0;

  comments.forEach(comment => {
    switch (comment.sentiment) {
      case 'toxic':
        score += 5;
        break;
      case 'manipulative':
        score += 4;
        break;
      case 'spam':
        score += 2;
        break;
    }
  });

  score += (liveStreams.length * 3);
  score += (uploads.length * 1);

  return score;
}

export function getRiskLevel(score) {
  if (score >= 20) return { level: 'High', color: 'red' };
  if (score >= 10) return { level: 'Moderate', color: 'yellow' };
  return { level: 'Low', color: 'green' };
}
