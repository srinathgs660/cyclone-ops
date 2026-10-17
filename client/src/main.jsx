import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

const apiBase = import.meta.env.VITE_API_URL || '';

if (apiBase) {
  axios.defaults.baseURL = apiBase.replace(/\/+$/, '');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register PWA Service Worker on mobile & production browsers
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA ServiceWorker Notice]:', err);
    });
  });
}
