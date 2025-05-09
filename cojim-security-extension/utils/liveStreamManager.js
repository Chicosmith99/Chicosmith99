// liveStreamManager.js - centralized management of flagged live streams and upload posts

const LIVE_STREAMS_KEY = 'flaggedLiveStreams';
const UPLOAD_POSTS_KEY = 'flaggedUploadPosts';

// Get all flagged live streams from storage
export async function getFlaggedLiveStreams() {
  return new Promise((resolve) => {
    chrome.storage.local.get([LIVE_STREAMS_KEY], (result) => {
      resolve(result[LIVE_STREAMS_KEY] || []);
    });
  });
}

// Save flagged live streams to storage
export async function saveFlaggedLiveStreams(liveStreams) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [LIVE_STREAMS_KEY]: liveStreams }, () => {
      resolve();
    });
  });
}

// Add a new flagged live stream
export async function addFlaggedLiveStream(liveStream) {
  const liveStreams = await getFlaggedLiveStreams();
  liveStreams.push(liveStream);
  await saveFlaggedLiveStreams(liveStreams);
}

// Get all flagged upload posts from storage
export async function getFlaggedUploadPosts() {
  return new Promise((resolve) => {
    chrome.storage.local.get([UPLOAD_POSTS_KEY], (result) => {
      resolve(result[UPLOAD_POSTS_KEY] || []);
    });
  });
}

// Save flagged upload posts to storage
export async function saveFlaggedUploadPosts(uploadPosts) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [UPLOAD_POSTS_KEY]: uploadPosts }, () => {
      resolve();
    });
  });
}

// Add a new flagged upload post
export async function addFlaggedUploadPost(uploadPost) {
  const uploadPosts = await getFlaggedUploadPosts();
  uploadPosts.push(uploadPost);
  await saveFlaggedUploadPosts(uploadPosts);
}
