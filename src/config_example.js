export const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
export const clientId = 'YOUR_CLIENT_ID_HERE';
export const redirectUri = 'http://localhost:3000';
export const scopes = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-playback-state',
];
