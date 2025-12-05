import React, { useState, useEffect, useCallback } from 'react';
import { LogEntry, ScormStatus, ScormState } from './types';
import { scormService } from './services/scormService';
import { LogConsole } from './components/LogConsole';
import { Button } from './components/Button';
import { Activity, Play, StopCircle, Save, CheckCircle, XCircle, BarChart3, HelpCircle, RotateCcw, Database, User, Clock, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ScormStatus>(ScormStatus.NOT_INITIALIZED);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  
  // Data Model State for UI
  const [cmiState, setCmiState] = useState<ScormState>({
    completionStatus: 'unknown',
    successStatus: 'unknown',
    scoreRaw: '',
    scoreScaled: '',
    location: '',
    suspendData: '',
    exit: 'suspend',
    entry: '',
    mode: '',
    learnerId: '',
    learnerName: '',
    credit: '',
    totalTime: '',
    launchData: '',
    language: ''
  });

  // Controlled inputs for data that might be restored
  const [locationInput, setLocationInput] = useState("");
  const [suspendInput, setSuspendInput] = useState("");

  // Inputs for Interactions
  const [interactionId, setInteractionId] = useState("question_1");
  const [interactionResult, setInteractionResult] = useState("correct");

  const addLog = useCallback((action: string, details: string, result: string, type: LogEntry['type'] = 'info') => {
    const error = scormService.getLastError();
    const errorString = error !== "0" ? ` (${scormService.getErrorString(error)})` : "";
    
    // Auto-fetch diagnostic if error
    if (error !== "0") {
        console.warn(`SCORM Error ${error}: ${scormService.getDiagnostic(error)}`);
    }

    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      action,
      details,
      result,
      error: error !== "0" ? `${error}${errorString}` : undefined,
      type: error !== "0" ? 'error' : type
    };
    
    setLogs(prev => [...prev, newLog]);
  }, []);

  // Update local state from LMS
  const refreshCmiState = useCallback(() => {
    if (status !== ScormStatus.INITIALIZED) return;

    // Fetch comprehensive data
    const newState = {
      completionStatus: scormService.getValue('cmi.completion_status'),
      successStatus: scormService.getValue('cmi.success_status'),
      scoreRaw: scormService.getValue('cmi.score.raw'),
      scoreScaled: scormService.getValue('cmi.score.scaled'),
      location: scormService.getValue('cmi.location'),
      suspendData: scormService.getValue('cmi.suspend_data'),
      exit: cmiState.exit, // Keep local UI state for this one until set
      entry: scormService.getValue('cmi.entry'),
      mode: scormService.getValue('cmi.mode'),
      // Learner Info
      learnerId: scormService.getValue('cmi.learner_id'),
      learnerName: scormService.getValue('cmi.learner_name'),
      credit: scormService.getValue('cmi.credit'),
      totalTime: scormService.getValue('cmi.total_time'),
      launchData: scormService.getValue('cmi.launch_data'),
      language: scormService.getValue('cmi.learner_preference.language')
    };

    setCmiState(newState);
    
    // Auto-populate inputs with restored data so user can see it immediately
    setLocationInput(newState.location);
    setSuspendInput(newState.suspendData);
  }, [status, cmiState.exit]);

  const handleInitialize = () => {
    const success = scormService.initialize();
    if (success) {
      setStatus(ScormStatus.INITIALIZED);
      addLog('Initialize', '("")', 'true', 'success');
      refreshCmiState();
    } else {
      setStatus(ScormStatus.FAILED_TO_CONNECT);
      addLog('Initialize', '("")', 'false', 'error');
    }
  };

  const handleTerminate = () => {
    // Before terminating, usually we set cmi.exit
    scormService.setValue('cmi.exit', cmiState.exit);
    
    const success = scormService.terminate();
    if (success) {
      setStatus(ScormStatus.TERMINATED);
      addLog('Terminate', '("")', 'true', 'success');
    } else {
      addLog('Terminate', '("")', 'false', 'error');
    }
  };

  const handleCommit = () => {
    const success = scormService.commit();
    addLog('Commit', '("")', success.toString(), success ? 'success' : 'error');
  };

  const handleSetValue = (element: string, value: string) => {
    const success = scormService.setValue(element, value);
    addLog('SetValue', `("${element}", "${value}")`, success.toString(), success ? 'success' : 'error');
    if (success) {
        // We partial update state for efficiency, or full refresh
        if (element === 'cmi.location') setCmiState(prev => ({...prev, location: value}));
        if (element === 'cmi.suspend_data') setCmiState(prev => ({...prev, suspendData: value}));
        refreshCmiState();
    }
  };

  const handleGetValue = (element: string) => {
    const val = scormService.getValue(element);
    addLog('GetValue', `("${element}")`, `"${val}"`, 'info');
  };

  const handleInteraction = () => {
    // Record a fake interaction
    // In SCORM 2004, we need to find an available index (n), but for this test we'll overwrite 0
    const n = 0; 
    const timestamp = new Date().toISOString();
    
    const cmds = [
        { key: `cmi.interactions.${n}.id`, val: interactionId },
        { key: `cmi.interactions.${n}.type`, val: 'true-false' },
        { key: `cmi.interactions.${n}.result`, val: interactionResult },
        { key: `cmi.interactions.${n}.timestamp`, val: timestamp },
        { key: `cmi.interactions.${n}.description`, val: 'Simulated question for testing' }
    ];

    let allSuccess = true;
    cmds.forEach(cmd => {
        const s = scormService.setValue(cmd.key, cmd.val);
        if (!s) allSuccess = false;
    });

    addLog('Interaction', `Recorded #${n} (${interactionId})`, allSuccess ? 'Success' : 'Partial/Fail', allSuccess ? 'success' : 'error');
    handleCommit();
  };

  // Attempt auto-init on load
  useEffect(() => {
    const timer = setTimeout(() => {
        handleInitialize();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      
      {/* LEFT SIDE: CONTROLS */}
      <div className="w-full md:w-1/2 lg:w-5/12 p-4 flex flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-white">
        
        {/* Header */}
        <div className="mb-2">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="text-scorm-600" />
                SCORM 2004 Validator
            </h1>
            <p className="text-slate-500 text-sm mt-1">
                LMS Implementation Test Suite
            </p>
        </div>

        {/* Connection Status */}
        <div className={`p-4 rounded-lg border flex items-center justify-between ${
            status === ScormStatus.INITIALIZED ? 'bg-green-50 border-green-200' : 
            status === ScormStatus.TERMINATED ? 'bg-orange-50 border-orange-200' : 
            'bg-red-50 border-red-200'
        }`}>
            <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">API Status</span>
                <span className={`font-bold ${
                     status === ScormStatus.INITIALIZED ? 'text-green-700' : 
                     status === ScormStatus.TERMINATED ? 'text-orange-700' : 
                     'text-red-700'
                }`}>{status}</span>
            </div>
            <div className="flex gap-2">
                <Button 
                    size="sm" 
                    variant="primary" 
                    onClick={handleInitialize} 
                    disabled={status === ScormStatus.INITIALIZED}
                    title="Initialize SCORM API"
                >
                    <Play size={16} />
                </Button>
                <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={handleTerminate} 
                    disabled={status !== ScormStatus.INITIALIZED}
                    title="Terminate SCORM Session"
                >
                    <StopCircle size={16} />
                </Button>
            </div>
        </div>
        
        {/* Restore/Entry Status Banner */}
        {status === ScormStatus.INITIALIZED && (
            <div className={`px-4 py-2 rounded border text-sm flex items-center gap-2 ${
                cmiState.entry === 'resume' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
                <RotateCcw size={16} />
                <span className="font-semibold">Entry Mode:</span> 
                <span className="font-mono">{cmiState.entry || 'empty'}</span>
                {cmiState.entry === 'resume' && <span className="ml-auto text-xs font-bold bg-blue-100 px-2 py-0.5 rounded text-blue-700">RESUMED</span>}
            </div>
        )}

        {/* Action Groups */}
        <div className="space-y-6">
            
            {/* Completion & Success */}
            <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3 border-b pb-1">Completion & Success</h3>
                <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => handleSetValue('cmi.completion_status', 'completed')} disabled={status !== ScormStatus.INITIALIZED} variant="outline" className="text-xs">
                        Set Completed
                    </Button>
                    <Button onClick={() => handleSetValue('cmi.completion_status', 'incomplete')} disabled={status !== ScormStatus.INITIALIZED} variant="outline" className="text-xs">
                        Set Incomplete
                    </Button>
                    <Button onClick={() => handleSetValue('cmi.success_status', 'passed')} disabled={status !== ScormStatus.INITIALIZED} variant="outline" className="text-xs">
                        Set Passed
                    </Button>
                    <Button onClick={() => handleSetValue('cmi.success_status', 'failed')} disabled={status !== ScormStatus.INITIALIZED} variant="outline" className="text-xs">
                        Set Failed
                    </Button>
                </div>
            </section>

            {/* Score */}
            <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3 border-b pb-1 flex justify-between">
                    <span>Score (Min:0, Max:100)</span>
                    <BarChart3 size={16} className="text-slate-400"/>
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <Button onClick={() => {
                        handleSetValue('cmi.score.min', '0');
                        handleSetValue('cmi.score.max', '100');
                        handleSetValue('cmi.score.raw', '100');
                        handleSetValue('cmi.score.scaled', '1.0');
                    }} disabled={status !== ScormStatus.INITIALIZED} variant="secondary" className="text-xs">
                        Score 100% (Raw 100)
                    </Button>
                    <Button onClick={() => {
                        handleSetValue('cmi.score.min', '0');
                        handleSetValue('cmi.score.max', '100');
                        handleSetValue('cmi.score.raw', '50');
                        handleSetValue('cmi.score.scaled', '0.5');
                    }} disabled={status !== ScormStatus.INITIALIZED} variant="secondary" className="text-xs">
                        Score 50% (Raw 50)
                    </Button>
                    <Button onClick={() => {
                        handleSetValue('cmi.score.min', '0');
                        handleSetValue('cmi.score.max', '100');
                        handleSetValue('cmi.score.raw', '0');
                        handleSetValue('cmi.score.scaled', '0');
                    }} disabled={status !== ScormStatus.INITIALIZED} variant="secondary" className="text-xs">
                        Score 0%
                    </Button>
                    <Button onClick={() => handleGetValue('cmi.score.raw')} disabled={status !== ScormStatus.INITIALIZED} variant="outline" className="text-xs">
                        Get Raw Score
                    </Button>
                </div>
            </section>

            {/* Bookmark & Suspend */}
            <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3 border-b pb-1 flex items-center justify-between">
                    <span>Bookmark & Suspend</span>
                    <Database size={16} className="text-slate-400" />
                </h3>
                <p className="text-[10px] text-slate-500 mb-2">Values below auto-populate from LMS on initialization.</p>
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="border rounded px-2 py-1 text-sm flex-1 bg-slate-50" 
                            placeholder="Location (cmi.location)"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                        />
                        <Button onClick={() => {
                            handleSetValue('cmi.location', locationInput);
                        }} disabled={status !== ScormStatus.INITIALIZED} variant="secondary" className="text-xs whitespace-nowrap">
                            Set Location
                        </Button>
                    </div>
                     <div className="flex gap-2">
                        <textarea 
                            className="border rounded px-2 py-1 text-sm flex-1 bg-slate-50 h-16 resize-none" 
                            placeholder="Suspend Data (cmi.suspend_data)"
                            value={suspendInput}
                            onChange={(e) => setSuspendInput(e.target.value)}
                        />
                        <Button onClick={() => {
                            handleSetValue('cmi.suspend_data', suspendInput);
                        }} disabled={status !== ScormStatus.INITIALIZED} variant="secondary" className="text-xs whitespace-nowrap h-16">
                            Set Data
                        </Button>
                    </div>
                </div>
            </section>

             {/* Interactions */}
             <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3 border-b pb-1">Interactions</h3>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex gap-2 mb-2">
                        <select 
                            className="text-xs border rounded p-1 flex-1"
                            value={interactionId}
                            onChange={(e) => setInteractionId(e.target.value)}
                        >
                            <option value="question_1">Question 1</option>
                            <option value="question_2">Question 2</option>
                            <option value="simulation_a">Simulation A</option>
                        </select>
                        <select 
                            className="text-xs border rounded p-1"
                            value={interactionResult}
                            onChange={(e) => setInteractionResult(e.target.value)}
                        >
                            <option value="correct">Correct</option>
                            <option value="incorrect">Incorrect</option>
                            <option value="neutral">Neutral</option>
                        </select>
                    </div>
                    <Button onClick={handleInteraction} disabled={status !== ScormStatus.INITIALIZED} fullWidth variant="primary" className="text-xs">
                        Record Interaction
                    </Button>
                </div>
            </section>

            {/* Exit Mode */}
            <section>
                 <h3 className="text-sm font-bold text-slate-900 mb-3 border-b pb-1">Exit Strategy</h3>
                 <div className="flex gap-2 mb-2">
                    <select 
                        className="border rounded p-2 text-sm w-full" 
                        value={cmiState.exit}
                        onChange={(e) => setCmiState({...cmiState, exit: e.target.value})}
                    >
                        <option value="suspend">Suspend (Save state)</option>
                        <option value="normal">Normal (Finished)</option>
                        <option value="logout">Logout</option>
                        <option value="timeout">Timeout</option>
                        <option value="">Empty String</option>
                    </select>
                 </div>
                 <div className="flex gap-2">
                    <Button onClick={handleCommit} disabled={status !== ScormStatus.INITIALIZED} variant="primary" fullWidth className="flex justify-center items-center gap-2">
                        <Save size={16} /> Commit
                    </Button>
                     <Button onClick={handleTerminate} disabled={status !== ScormStatus.INITIALIZED} variant="danger" fullWidth className="flex justify-center items-center gap-2">
                        <XCircle size={16} /> Exit
                    </Button>
                 </div>
            </section>

            <div className="pt-4 border-t">
                 <Button variant="secondary" fullWidth onClick={() => setShowHelp(!showHelp)} className="flex items-center justify-center gap-2">
                    <HelpCircle size={16}/> {showHelp ? 'Hide Instructions' : 'Show Instructions'}
                 </Button>
            </div>

        </div>
      </div>

      {/* RIGHT SIDE: STATUS & LOGS */}
      <div className="w-full md:w-1/2 lg:w-7/12 bg-slate-100 flex flex-col p-4 h-full overflow-hidden">
        
        {/* Learner & Session Info Panel */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4 shrink-0">
             <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <User size={14}/> Learner & LMS Information
             </h2>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                 <div>
                    <label className="text-[10px] text-slate-400 block">Learner Name</label>
                    <div className="text-sm font-semibold truncate" title={cmiState.learnerName || 'N/A'}>
                        {cmiState.learnerName || <span className="text-slate-300 italic">N/A</span>}
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] text-slate-400 block">Learner ID</label>
                    <div className="text-sm font-mono truncate" title={cmiState.learnerId || 'N/A'}>
                        {cmiState.learnerId || <span className="text-slate-300 italic">N/A</span>}
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] text-slate-400 block">Credit Mode</label>
                    <div className="text-sm font-mono truncate">
                         {cmiState.credit ? (
                             <span className={`px-1.5 py-0.5 rounded text-xs ${cmiState.credit === 'credit' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                 {cmiState.credit}
                             </span>
                         ) : <span className="text-slate-300 italic">N/A</span>}
                    </div>
                 </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Total Previous Time</label>
                    <div className="text-sm font-mono truncate flex items-center gap-1">
                        <Clock size={12} className="text-slate-400"/>
                        {cmiState.totalTime || <span className="text-slate-300 italic">PT0H0M0S</span>}
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] text-slate-400 block">Language</label>
                    <div className="text-sm truncate">
                        {cmiState.language || <span className="text-slate-300 italic">N/A</span>}
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] text-slate-400 block">Launch Data</label>
                    <div className="text-sm font-mono truncate text-slate-600" title={cmiState.launchData}>
                        {cmiState.launchData ? (
                            <span className="flex items-center gap-1"><FileText size={12}/> {cmiState.launchData}</span>
                        ) : <span className="text-slate-300 italic">Empty</span>}
                    </div>
                 </div>
             </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 shrink-0">
            <StatusCard label="Mode" value={cmiState.mode || 'normal'} />
            <StatusCard label="Entry" value={cmiState.entry || 'ab-initio'} icon={<RotateCcw size={14} />} />
            <StatusCard label="Completion" value={cmiState.completionStatus} icon={<Activity size={14}/>} />
            <StatusCard label="Success" value={cmiState.successStatus} icon={<CheckCircle size={14}/>} />
            <StatusCard label="Raw Score" value={cmiState.scoreRaw || '--'} />
        </div>

        {/* Instructions Overlay (Conditional) */}
        {showHelp && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 text-sm text-blue-900 shrink-0 overflow-y-auto max-h-60 shadow-sm">
                <h4 className="font-bold mb-2">How to test Resume/Restore</h4>
                <ul className="list-disc list-inside space-y-1 mb-2">
                    <li><strong>1. Start:</strong> Launch the course. <code>Entry</code> should be 'ab-initio'.</li>
                    <li><strong>2. Save Data:</strong> Type text into "Location" and "Suspend Data" boxes and click the "Set" buttons next to them.</li>
                    <li><strong>3. Suspend:</strong> Select "Suspend" in Exit Strategy and click "Exit".</li>
                    <li><strong>4. Relaunch:</strong> Launch the course again from the LMS.</li>
                    <li><strong>5. Verify:</strong> <code>Entry</code> should be 'resume'. The text boxes should automatically populate with your saved data.</li>
                </ul>
                <h4 className="font-bold mb-2 mt-4">General Usage</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Set Status:</strong> Updates <code>cmi.completion_status</code> and <code>cmi.success_status</code>.</li>
                    <li><strong>Score:</strong> Sets <code>min(0)</code>, <code>max(100)</code>, <code>raw</code>, and <code>scaled</code>.</li>
                    <li><strong>Commit:</strong> Force saves data to the server immediately.</li>
                </ul>
            </div>
        )}

        {/* Console */}
        <div className="flex-1 min-h-0">
            <LogConsole logs={logs} onClear={() => setLogs([])} />
        </div>
      </div>

    </div>
  );
};

const StatusCard = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
    <div className="bg-white p-3 rounded shadow-sm border border-slate-200">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
            {icon} {label}
        </div>
        <div className="font-mono text-sm font-semibold truncate text-slate-800" title={value}>
            {value}
        </div>
    </div>
);

export default App;