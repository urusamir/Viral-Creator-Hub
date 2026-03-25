// Vercel Serverless API handler
// This adapts the Express auth routes to Vercel's serverless functions

export default function handler(req, res) {
  // For now, return a simple JSON response for API routes
  // The main app functionality is client-side with mock data
  const path = req.url;

  if (path === '/api/auth/session') {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (path === '/api/auth/login' && req.method === 'POST') {
    return res.status(401).json({ message: 'Authentication not available in demo mode' });
  }

  if (path === '/api/auth/signup' && req.method === 'POST') {
    return res.status(401).json({ message: 'Authentication not available in demo mode' });
  }

  if (path === '/api/auth/logout' && req.method === 'POST') {
    return res.json({ message: 'Logged out' });
  }

  return res.status(404).json({ message: 'Not found' });
}
