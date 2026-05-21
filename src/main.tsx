import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign WebSocket errors caused by disabled HMR
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && 
      (event.reason.message?.includes('WebSocket closed') || 
       event.reason.message?.includes('failed to connect to websocket'))) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
