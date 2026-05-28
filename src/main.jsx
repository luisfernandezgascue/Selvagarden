import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Etiquetas from './screens/Etiquetas';
import './styles.css';

const path = window.location.pathname;
const root = ReactDOM.createRoot(document.getElementById('root'));

if (path.startsWith('/etiquetas')) {
  root.render(<Etiquetas />);
} else {
  root.render(<App />);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
