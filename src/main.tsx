import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";

// كود بسيط لاصطياد الأخطاء وعرضها على الشاشة
const rootElement = document.getElementById("root");

if (!rootElement) throw new Error('Failed to find the root element');

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Application Error:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif; direction: ltr;">
      <h1>Application Crashed</h1>
      <p>Something went wrong during initialization.</p>
      <pre style="background: #f0f0f0; padding: 10px; overflow: auto;">${error}</pre>
      <button onclick="localStorage.clear(); window.location.reload();" style="padding: 10px 20px; background: red; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
        Reset App Data (Fix Crash)
      </button>
    </div>
  `;
}
