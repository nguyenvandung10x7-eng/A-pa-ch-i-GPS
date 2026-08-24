import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './i18n/reactI18next';
import './index.css';
import './book-soundtrack.css';
import './field-v2.css';
import './typography-v2.css';
import './surface-label-redesign.css';
import './atlas-obscura-inspired.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
