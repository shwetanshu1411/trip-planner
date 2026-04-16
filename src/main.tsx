import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { LogIn, AlertCircle } from 'lucide-react';
import App from './App.tsx';
import './index.css';

const rawKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// Sanitize key: remove accidental prefixes (like 'N' or 'key='), whitespace, and quotes
const PUBLISHABLE_KEY = rawKey?.trim()?.replace(/^N?pk_/, 'pk_')?.split(' ')[0];

function Root() {
  const isInvalidKey = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.startsWith('pk_');

  if (!PUBLISHABLE_KEY || isInvalidKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              {isInvalidKey ? "Invalid Clerk Key" : "Setup Required"}
            </h2>
            <p className="text-slate-500">
              {isInvalidKey 
                ? "The Clerk Publishable Key you provided appears to be invalid. It should start with 'pk_test_' or 'pk_live_'."
                : "To enable authentication and cloud saving, please add your Clerk Publishable Key to the Secrets panel."}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg text-left text-xs font-mono text-slate-600 border border-slate-100 break-all">
            <strong>Expected Format:</strong><br/>
            pk_test_... (no extra text or prefixes)
          </div>
          <p className="text-xs text-slate-400">
            Check your Secrets panel for <strong>VITE_CLERK_PUBLISHABLE_KEY</strong>. Ensure there are no extra characters like "N" or "CLERK_SECRET_KEY" in the value.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
