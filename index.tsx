
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
const loader = document.getElementById('boot-loader');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Hide the boot loader after a small delay to ensure rendering has started
  setTimeout(() => {
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  }, 500);
} catch (error) {
  console.error("Critical boot error:", error);
  if (loader) {
    loader.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
      <h2 style="margin-bottom: 10px;">UrbanNest failed to start</h2>
      <p style="font-size: 14px;">${error instanceof Error ? error.message : String(error)}</p>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2D5A47; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry</button>
    </div>`;
  }
}