import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/authContext';
import "./index.css";

// 🛡️ Catch ResizeObserver error AVANT que React démarre
window.addEventListener('error', (e) => {
  if (e.message?.includes('ResizeObserver loop completed')) {
    e.stopImmediatePropagation();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
        <AuthProvider>
            <App />
        </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
