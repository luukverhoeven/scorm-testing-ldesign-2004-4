import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Trash2, Terminal } from 'lucide-react';

interface LogConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const LogConsole: React.FC<LogConsoleProps> = ({ logs, onClear }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2 text-slate-200">
          <Terminal size={18} />
          <h2 className="font-mono font-bold text-sm">SCORM Transaction Log</h2>
        </div>
        <button 
          onClick={onClear}
          className="text-slate-400 hover:text-red-400 transition-colors p-1"
          title="Clear Logs"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
        {logs.length === 0 && (
          <div className="text-slate-500 text-center mt-10 italic">
            Waiting for SCORM API calls...
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
            <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
            <div className="flex-1 break-words">
              <span className={`font-bold ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'success' ? 'text-green-400' : 'text-blue-400'
              }`}>
                {log.action}
              </span>
              <span className="text-slate-300 mx-2">{log.details}</span>
              {log.result && (
                <span className="text-yellow-500 block sm:inline mt-1 sm:mt-0">
                  → Returns: {log.result}
                </span>
              )}
              {log.error && log.error !== "0" && (
                <span className="text-red-400 block font-bold mt-1">
                  ⚠ Error Code: {log.error}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};