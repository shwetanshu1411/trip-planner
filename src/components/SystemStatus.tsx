import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, XCircle, Loader2, Database, Key, Map as MapIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface StatusData {
  mongodb: string;
  env: {
    hasMongoUri: boolean;
    hasClerkKey: boolean;
    hasMapboxToken: boolean;
  };
}

const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/status');
      setStatus(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to connect to the backend server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) return null;

  const isHealthy = status?.mongodb === 'connected' && 
                    status?.env.hasMongoUri && 
                    status?.env.hasClerkKey && 
                    status?.env.hasMapboxToken;

  if (isHealthy && !showDetails) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4">
      <Alert variant={isHealthy ? "default" : "destructive"} className="shadow-lg border-2 bg-white">
        <div className="flex items-start justify-between w-full">
          <div className="flex gap-3">
            {isHealthy ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <div>
              <AlertTitle className="font-bold">
                {isHealthy ? "System Healthy" : "Configuration Issues"}
              </AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {isHealthy 
                  ? "All systems are connected and configured." 
                  : "Some features may be disabled due to missing or incorrect keys."}
              </AlertDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-[10px] uppercase font-bold tracking-wider"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide" : "Details"}
          </Button>
        </div>

        {showDetails && (
          <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
            <StatusItem 
              icon={<Database className="w-3.5 h-3.5" />}
              label="MongoDB"
              status={status?.mongodb === 'connected' ? 'ok' : 'error'}
              detail={status?.mongodb || 'disconnected'}
            />
            <StatusItem 
              icon={<Key className="w-3.5 h-3.5" />}
              label="Clerk Auth"
              status={status?.env.hasClerkKey ? 'ok' : 'error'}
              detail={status?.env.hasClerkKey ? 'Configured' : 'Missing Key'}
            />
            <StatusItem 
              icon={<MapIcon className="w-3.5 h-3.5" />}
              label="Mapbox"
              status={status?.env.hasMapboxToken ? 'ok' : 'error'}
              detail={status?.env.hasMapboxToken ? 'Configured' : 'Missing Token'}
            />
            {!isHealthy && (
              <p className="text-[10px] text-slate-400 italic mt-2">
                Update your secrets in the sidebar to resolve these issues.
              </p>
            )}
          </div>
        )}
      </Alert>
    </div>
  );
};

const StatusItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  status: 'ok' | 'error' | 'loading';
  detail: string;
}> = ({ icon, label, status, detail }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-center gap-2 text-slate-600">
      {icon}
      <span>{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className={`font-medium ${status === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
        {detail}
      </span>
      {status === 'ok' ? (
        <CheckCircle2 className="w-3 h-3 text-green-500" />
      ) : (
        <XCircle className="w-3 h-3 text-red-500" />
      )}
    </div>
  </div>
);

export default SystemStatus;
