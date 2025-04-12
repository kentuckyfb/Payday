
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Mount the app with the most basic setup possible
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  
  // Render without StrictMode to avoid double-mounting issues
  root.render(<App />);
} else {
  console.error("Root element not found!");
}
