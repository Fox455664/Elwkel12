import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";

// --- هذا هو المكون الذي سيصيد الخطأ ويطبعه لك ---
class GlobalErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Global Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // تصميم شاشة الخطأ لتظهر فوق كل شيء
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: '#1a1a1a',
          color: '#ff4444',
          zIndex: 999999,
          padding: '20px',
          overflow: 'auto',
          fontFamily: 'monospace',
          direction: 'ltr',
          textAlign: 'left'
        }}>
          <h1 style={{ color: 'white', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
            ⛔ Fatal Error Detected
          </h1>
          
          <h3 style={{ marginTop: '20px', fontSize: '18px' }}>
            {this.state.error?.toString()}
          </h3>

          <pre style={{ 
            marginTop: '20px', 
            whiteSpace: 'pre-wrap', 
            color: '#aaa', 
            fontSize: '12px',
            backgroundColor: '#000',
            padding: '10px',
            borderRadius: '5px'
          }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
