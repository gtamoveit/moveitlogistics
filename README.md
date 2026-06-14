# Move It Logistics - Container Tracking Website

Simple and fast container tracking website for Move It Logistics clients.

## Features

- 🔍 Real-time container tracking
- 🚀 Fast and responsive interface
- 📱 Mobile-friendly design
- 🎨 Clean and professional UI

## Setup

1. Clone the repository
2. Add your logo as `logo.png` in the root directory
3. Deploy to your web server or hosting platform

## Configuration

The API configuration is in `script.js`:

```javascript
const API_BASE_URL = 'https://fleet-monitor-169.emergent.host';
const API_KEY = 'sk-emergent-94eA9127216D46b8d4';
```

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and responsive design
- `script.js` - JavaScript functionality and API integration
- `logo.png` - Your company logo (needs to be added)

## Deployment

You can deploy this to:
- GitHub Pages (free)
- Netlify
- Vercel
- Your own web server
- Any static hosting service

## API Endpoints

The website connects to your fleet monitor backend at:
- Base URL: `https://fleet-monitor-169.emergent.host`
- Endpoint: `GET /api/containers/{containerNumber}`
- Authentication: Bearer token in Authorization header
