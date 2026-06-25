// src/index.js  ← entry point (works with CRA or Vite)
// This replaces the default Create-React-App boilerplate.
// If you see errors about index.css or reportWebVitals, you had the
// default CRA index.js — this file fixes all of that.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register the Push Notification service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[ZaraDrop] SW registered:', reg.scope))
      .catch((err) => console.warn('[ZaraDrop] SW registration failed:', err));
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);