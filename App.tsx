import React, { useState, useEffect, useCallback } from 'react';
import { LogEntry, ScormStatus, ScormState } from './types';
import { scormService } from './services/scormService';
import { LogConsole } from './components/LogConsole';
import { Button } from './components/Button';
import {
  Activity, Play, StopCircle, Save, CheckCircle, XCircle,
  HelpCircle, RotateCcw, User, Clock, FileText, Info,
  Award, ThumbsDown, Bookmark, ChevronDown, ChevronUp,
  Zap, Settings, Download, AlertTriangle, Database, Type, Gauge,
  SlidersHorizontal, RefreshCw
} from 'lucide-react';

// Toast notification component
const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-pulse`}>
      {type === 'success' && <CheckCircle size={20} />}
      {type === 'error' && <XCircle size={20} />}
      {type === 'info' && <Info size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

const App: React.FC = () => {
  const [status, setStatus] = useState<ScormStatus>(ScormStatus.NOT_INITIALIZED);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [customScore, setCustomScore] = useState(75);

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
    language: '',
    // Additional preferences
    audioLevel: '',
    audioCaptioning: '',
    deliverySpeed: '',
    // SCO config
    scaledPassingScore: '',
    maxTimeAllowed: '',
    timeLimitAction: '',
    // Progress & counts
    completionThreshold: '',
    progressMeasure: '',
    objectivesCount: '',
    interactionsCount: ''
  });

  // Controlled inputs for data that might be restored
  const [locationInput, setLocationInput] = useState("");
  const [suspendInput, setSuspendInput] = useState("");

  // Inputs for Interactions
  const [interactionId, setInteractionId] = useState("question_1");
  const [interactionResult, setInteractionResult] = useState("correct");

  // Session timing for cmi.session_time
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Visual restore test slider
  const [restoreTestValue, setRestoreTestValue] = useState(50);
  const [restoreTestWasRestored, setRestoreTestWasRestored] = useState(false);
  const [restoreTestOriginalValue, setRestoreTestOriginalValue] = useState<number | null>(null);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Convert milliseconds to ISO 8601 duration format (PTxHxMxS)
  const formatSessionTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `PT${hours}H${minutes}M${seconds}S`;
  };

  const addLog = useCallback((action: string, details: string, result: string, type: LogEntry['type'] = 'info') => {
    const error = scormService.getLastError();
    const errorString = error !== "0" ? ` (${scormService.getErrorString(error)})` : "";

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
  const refreshCmiState = useCallback((forceRefresh = false) => {
    if (!forceRefresh && status !== ScormStatus.INITIALIZED) return;

    const newState = {
      completionStatus: scormService.getValue('cmi.completion_status'),
      successStatus: scormService.getValue('cmi.success_status'),
      scoreRaw: scormService.getValue('cmi.score.raw'),
      scoreScaled: scormService.getValue('cmi.score.scaled'),
      location: scormService.getValue('cmi.location'),
      suspendData: scormService.getValue('cmi.suspend_data'),
      exit: cmiState.exit,
      entry: scormService.getValue('cmi.entry'),
      mode: scormService.getValue('cmi.mode'),
      learnerId: scormService.getValue('cmi.learner_id'),
      learnerName: scormService.getValue('cmi.learner_name'),
      credit: scormService.getValue('cmi.credit'),
      totalTime: scormService.getValue('cmi.total_time'),
      launchData: scormService.getValue('cmi.launch_data'),
      language: scormService.getValue('cmi.learner_preference.language'),
      // Additional learner preferences
      audioLevel: scormService.getValue('cmi.learner_preference.audio_level'),
      audioCaptioning: scormService.getValue('cmi.learner_preference.audio_captioning'),
      deliverySpeed: scormService.getValue('cmi.learner_preference.delivery_speed'),
      // SCO configuration
      scaledPassingScore: scormService.getValue('cmi.scaled_passing_score'),
      maxTimeAllowed: scormService.getValue('cmi.max_time_allowed'),
      timeLimitAction: scormService.getValue('cmi.time_limit_action'),
      // Progress & counts
      completionThreshold: scormService.getValue('cmi.completion_threshold'),
      progressMeasure: scormService.getValue('cmi.progress_measure'),
      objectivesCount: scormService.getValue('cmi.objectives._count'),
      interactionsCount: scormService.getValue('cmi.interactions._count')
    };

    setCmiState(newState);
    setLocationInput(newState.location);
    setSuspendInput(newState.suspendData);

    // Check for restore test value in suspend_data
    if (newState.suspendData) {
      try {
        const parsed = JSON.parse(newState.suspendData);
        if (parsed && typeof parsed.restoreTestSlider === 'number') {
          setRestoreTestValue(parsed.restoreTestSlider);
          setRestoreTestOriginalValue(parsed.restoreTestSlider);
          setRestoreTestWasRestored(true);
        }
      } catch {
        // Not JSON or no restore test data - that's fine
      }
    }
  }, [status, cmiState.exit]);

  const handleInitialize = () => {
    const success = scormService.initialize();
    if (success) {
      setStatus(ScormStatus.INITIALIZED);
      setSessionStartTime(Date.now());
      addLog('Initialize', '("")', 'true', 'success');
      refreshCmiState(true);
      showToast('Connected to LMS!', 'success');
    } else {
      setStatus(ScormStatus.FAILED_TO_CONNECT);
      addLog('Initialize', '("")', 'false', 'error');
      showToast('Failed to connect to LMS', 'error');
    }
  };

  const handleTerminate = () => {
    scormService.setValue('cmi.exit', cmiState.exit);

    if (sessionStartTime) {
      const sessionDuration = Date.now() - sessionStartTime;
      const sessionTimeFormatted = formatSessionTime(sessionDuration);
      scormService.setValue('cmi.session_time', sessionTimeFormatted);
      addLog('SetValue', `("cmi.session_time", "${sessionTimeFormatted}")`, 'true', 'info');
    }

    scormService.commit();
    addLog('Commit', '("") - Auto before Terminate', 'true', 'info');

    const success = scormService.terminate();
    if (success) {
      setStatus(ScormStatus.TERMINATED);
      addLog('Terminate', '("")', 'true', 'success');
      showToast('Session closed and saved!', 'success');
    } else {
      addLog('Terminate', '("")', 'false', 'error');
      showToast('Failed to close session', 'error');
    }
  };

  const handleCommit = () => {
    const success = scormService.commit();
    addLog('Commit', '("")', success.toString(), success ? 'success' : 'error');
    if (success) {
      showToast('Progress saved!', 'success');
    }
  };

  const handleSetValue = (element: string, value: string, silent = false) => {
    const success = scormService.setValue(element, value);
    addLog('SetValue', `("${element}", "${value}")`, success.toString(), success ? 'success' : 'error');
    if (success) {
      if (element === 'cmi.location') setCmiState(prev => ({...prev, location: value}));
      if (element === 'cmi.suspend_data') setCmiState(prev => ({...prev, suspendData: value}));
      refreshCmiState();
    }
    return success;
  };

  const handleGetValue = (element: string) => {
    const val = scormService.getValue(element);
    addLog('GetValue', `("${element}")`, `"${val}"`, 'info');
  };

  // ===== QUICK TEST SCENARIOS =====

  const runPassTest = () => {
    if (status !== ScormStatus.INITIALIZED) return;

    handleSetValue('cmi.completion_status', 'completed', true);
    handleSetValue('cmi.success_status', 'passed', true);
    handleSetValue('cmi.score.min', '0', true);
    handleSetValue('cmi.score.max', '100', true);
    handleSetValue('cmi.score.raw', '100', true);
    handleSetValue('cmi.score.scaled', '1.0', true);
    setCmiState(prev => ({...prev, exit: 'normal'}));
    scormService.setValue('cmi.exit', 'normal');
    handleCommit();

    showToast('Test set: PASSED with 100% - Click "Close & Save" to finish', 'success');
  };

  const runFailTest = () => {
    if (status !== ScormStatus.INITIALIZED) return;

    handleSetValue('cmi.completion_status', 'incomplete', true);
    handleSetValue('cmi.success_status', 'failed', true);
    handleSetValue('cmi.score.min', '0', true);
    handleSetValue('cmi.score.max', '100', true);
    handleSetValue('cmi.score.raw', '0', true);
    handleSetValue('cmi.score.scaled', '0', true);
    setCmiState(prev => ({...prev, exit: 'normal'}));
    scormService.setValue('cmi.exit', 'normal');
    handleCommit();

    showToast('Test set: FAILED with 0% - Click "Close & Save" to finish', 'info');
  };

  const runSuspendTest = () => {
    if (status !== ScormStatus.INITIALIZED) return;

    // Use manual input values if provided, otherwise use defaults
    const testLocation = locationInput.trim() || 'Page 5 - Section A';
    const testData = suspendInput.trim() || 'Test bookmark: ' + new Date().toISOString();

    handleSetValue('cmi.location', testLocation, true);
    handleSetValue('cmi.suspend_data', testData, true);
    setLocationInput(testLocation);
    setSuspendInput(testData);
    setCmiState(prev => ({...prev, exit: 'suspend'}));
    scormService.setValue('cmi.exit', 'suspend');
    handleCommit();

    const msg = locationInput.trim()
      ? 'Your bookmark saved - Click "Close & Save", then reopen to test resume'
      : 'Test bookmark saved - Click "Close & Save", then reopen to test resume';
    showToast(msg, 'info');
  };

  const setCustomScoreValue = () => {
    if (status !== ScormStatus.INITIALIZED) return;

    handleSetValue('cmi.score.min', '0', true);
    handleSetValue('cmi.score.max', '100', true);
    handleSetValue('cmi.score.raw', customScore.toString(), true);
    handleSetValue('cmi.score.scaled', (customScore / 100).toFixed(2), true);
    handleCommit();

    showToast(`Grade set to ${customScore}%`, 'success');
  };

  const handleInteraction = () => {
    const n = 0;
    const timestamp = new Date().toISOString().replace('Z', '').split('.')[0];
    const learnerResponse = interactionResult === 'correct' ? 'true' : 'false';

    const cmds = [
      { key: `cmi.interactions.${n}.id`, val: interactionId },
      { key: `cmi.interactions.${n}.type`, val: 'true-false' },
      { key: `cmi.interactions.${n}.learner_response`, val: learnerResponse },
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

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scorm-test-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Log exported!', 'success');
  };

  // ===== RESTORE TEST SLIDER =====

  const saveRestoreTestSlider = () => {
    if (status !== ScormStatus.INITIALIZED) return;

    const dataToSave = JSON.stringify({
      restoreTestSlider: restoreTestValue,
      savedAt: new Date().toISOString()
    });

    const success = scormService.setValue('cmi.suspend_data', dataToSave);
    if (success) {
      scormService.setValue('cmi.exit', 'suspend');
      setCmiState(prev => ({ ...prev, exit: 'suspend' }));
      handleCommit();
      addLog('RestoreTest', `Saved slider value: ${restoreTestValue}`, 'Success', 'success');
      showToast(`Slider saved at ${restoreTestValue}% - Close & reopen to test restore`, 'success');
      setSuspendInput(dataToSave);
    } else {
      addLog('RestoreTest', `Failed to save slider value`, 'Failed', 'error');
      showToast('Failed to save slider value', 'error');
    }
  };

  const resetRestoreTest = () => {
    setRestoreTestValue(50);
    setRestoreTestWasRestored(false);
    setRestoreTestOriginalValue(null);
    showToast('Restore test reset', 'info');
  };

  // ===== TROUBLESHOOTING TESTS =====

  // Generate test data of specified size
  const generateTestData = (sizeKB: number): string => {
    const pattern = 'ABCD1234';
    const targetSize = sizeKB * 1024;
    let data = `[TEST:${sizeKB}KB]`;
    while (data.length < targetSize) {
      data += pattern;
    }
    return data.substring(0, targetSize);
  };

  // Test large data storage
  const testLargeData = (sizeKB: number) => {
    if (status !== ScormStatus.INITIALIZED) return;

    const testData = generateTestData(sizeKB);
    addLog('Test', `Testing ${sizeKB}KB suspend_data storage...`, 'Starting', 'info');

    const success = scormService.setValue('cmi.suspend_data', testData);
    if (success) {
      // Verify by reading back
      const readBack = scormService.getValue('cmi.suspend_data');
      const verified = readBack.length === testData.length;

      if (verified) {
        addLog('Test', `${sizeKB}KB suspend_data`, `SUCCESS (${testData.length} chars stored & verified)`, 'success');
        showToast(`${sizeKB}KB stored successfully!`, 'success');
      } else {
        addLog('Test', `${sizeKB}KB suspend_data`, `PARTIAL: Stored ${readBack.length} of ${testData.length} chars`, 'warning');
        showToast(`${sizeKB}KB partially stored (${readBack.length} chars)`, 'error');
      }
    } else {
      addLog('Test', `${sizeKB}KB suspend_data`, 'FAILED - LMS rejected the data', 'error');
      showToast(`${sizeKB}KB storage FAILED`, 'error');
    }

    handleCommit();
  };

  // Test special characters
  const testSpecialChars = () => {
    if (status !== ScormStatus.INITIALIZED) return;

    const specialData = [
      '<script>alert("XSS")</script>',
      '"double quotes" and \'single quotes\'',
      'Unicode: émojis 🎓📚✅❌',
      '日本語 中文 한국어',
      'Newlines:\nTabs:\tBackslash:\\',
      '&amp; &lt; &gt; &quot;',
      'NULL: \x00 and special: \x1F'
    ].join(' | ');

    addLog('Test', 'Testing special characters in suspend_data...', 'Starting', 'info');

    const success = scormService.setValue('cmi.suspend_data', specialData);
    if (success) {
      const readBack = scormService.getValue('cmi.suspend_data');
      const match = readBack === specialData;

      if (match) {
        addLog('Test', 'Special characters', 'SUCCESS - All characters preserved', 'success');
        showToast('Special characters stored correctly!', 'success');
      } else {
        addLog('Test', 'Special characters', `MODIFIED: Some chars changed. Original: ${specialData.length}, Retrieved: ${readBack.length}`, 'warning');
        showToast('Special chars modified by LMS', 'error');
      }
    } else {
      addLog('Test', 'Special characters', 'FAILED - LMS rejected the data', 'error');
      showToast('Special chars storage FAILED', 'error');
    }

    handleCommit();
    setSuspendInput(specialData);
  };

  // Test rapid commits
  const testRapidCommits = async () => {
    if (status !== ScormStatus.INITIALIZED) return;

    addLog('Test', 'Testing 10 rapid commits...', 'Starting', 'info');
    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i <= 10; i++) {
      scormService.setValue('cmi.suspend_data', `Rapid commit test #${i} at ${Date.now()}`);
      const success = scormService.commit();
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (failCount === 0) {
      addLog('Test', 'Rapid commits', `SUCCESS - All 10 commits succeeded`, 'success');
      showToast('All 10 rapid commits succeeded!', 'success');
    } else {
      addLog('Test', 'Rapid commits', `PARTIAL: ${successCount}/10 succeeded, ${failCount} failed`, 'warning');
      showToast(`Rapid commits: ${failCount} failed`, 'error');
    }
  };

  // Test score edge cases
  const testScoreEdgeCases = () => {
    if (status !== ScormStatus.INITIALIZED) return;

    addLog('Test', 'Testing score edge cases...', 'Starting', 'info');
    const tests = [
      { name: 'scaled=-1.0', key: 'cmi.score.scaled', val: '-1.0' },
      { name: 'scaled=0', key: 'cmi.score.scaled', val: '0' },
      { name: 'scaled=1.0', key: 'cmi.score.scaled', val: '1.0' },
      { name: 'raw=0', key: 'cmi.score.raw', val: '0' },
      { name: 'raw=100', key: 'cmi.score.raw', val: '100' },
      { name: 'min=0', key: 'cmi.score.min', val: '0' },
      { name: 'max=100', key: 'cmi.score.max', val: '100' }
    ];

    let allPassed = true;
    tests.forEach(test => {
      const success = scormService.setValue(test.key, test.val);
      if (!success) {
        addLog('Test', `Score ${test.name}`, 'FAILED', 'error');
        allPassed = false;
      }
    });

    if (allPassed) {
      addLog('Test', 'Score edge cases', 'SUCCESS - All values accepted', 'success');
      showToast('All score edge cases passed!', 'success');
    } else {
      showToast('Some score values rejected', 'error');
    }

    handleCommit();
    refreshCmiState();
  };

  // Test long bookmark
  const testLongBookmark = (length: number) => {
    if (status !== ScormStatus.INITIALIZED) return;

    const bookmark = 'B'.repeat(length);
    addLog('Test', `Testing ${length}-char bookmark...`, 'Starting', 'info');

    const success = scormService.setValue('cmi.location', bookmark);
    if (success) {
      const readBack = scormService.getValue('cmi.location');
      if (readBack.length === length) {
        addLog('Test', `${length}-char bookmark`, 'SUCCESS', 'success');
        showToast(`${length}-char bookmark stored!`, 'success');
      } else {
        addLog('Test', `${length}-char bookmark`, `TRUNCATED to ${readBack.length} chars`, 'warning');
        showToast(`Bookmark truncated to ${readBack.length}`, 'error');
      }
    } else {
      addLog('Test', `${length}-char bookmark`, 'FAILED', 'error');
      showToast(`${length}-char bookmark FAILED`, 'error');
    }

    handleCommit();
    setLocationInput(bookmark);
  };

  // Attempt auto-init on load
  useEffect(() => {
    const timer = setTimeout(() => {
      handleInitialize();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isReady = status === ScormStatus.INITIALIZED;
  const isResumed = cmiState.entry === 'resume';

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* LEFT SIDE: CONTROLS */}
      <div className="w-full md:w-1/2 lg:w-5/12 p-4 flex flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-white">

        {/* Header */}
        <div className="mb-2">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-scorm-600" />
            SCORM Test Tool
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Test your LMS course tracking in minutes
          </p>
        </div>

        {/* Connection Status */}
        <div className={`p-4 rounded-lg border flex items-center justify-between ${
          status === ScormStatus.INITIALIZED ? 'bg-green-50 border-green-200' :
          status === ScormStatus.TERMINATED ? 'bg-orange-50 border-orange-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Connection</span>
            <span className={`font-bold ${
              status === ScormStatus.INITIALIZED ? 'text-green-700' :
              status === ScormStatus.TERMINATED ? 'text-orange-700' :
              'text-red-700'
            }`}>
              {status === ScormStatus.INITIALIZED ? 'Ready' :
               status === ScormStatus.TERMINATED ? 'Closed' :
               status === ScormStatus.FAILED_TO_CONNECT ? 'Connection Failed' : 'Connecting...'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={handleInitialize}
              disabled={status === ScormStatus.INITIALIZED}
              title="Connect to LMS"
            >
              <Play size={16} />
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleTerminate}
              disabled={!isReady}
              title="Close & Save"
            >
              <StopCircle size={16} />
            </Button>
          </div>
        </div>

        {/* Resume Banner */}
        {isReady && isResumed && (
          <div className="px-4 py-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
            <div className="flex items-center gap-2">
              <RotateCcw size={18} />
              <span className="font-bold">Resumed Session!</span>
            </div>
            <p className="text-sm mt-1 text-blue-700">
              Your previous progress was restored. Check the bookmark and saved data below.
            </p>
          </div>
        )}

        {/* ===== QUICK TESTS SECTION ===== */}
        <section className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-amber-500" size={20} />
            <h3 className="text-sm font-bold text-slate-900">Quick Tests</h3>
            <span className="text-xs text-slate-500 ml-auto">One-click test scenarios</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={runPassTest}
              disabled={!isReady}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-all"
            >
              <Award size={24} />
              <span className="text-xs font-bold">Pass Test</span>
              <span className="text-[10px] opacity-80">100% + Passed</span>
            </button>

            <button
              onClick={runFailTest}
              disabled={!isReady}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-all"
            >
              <ThumbsDown size={24} />
              <span className="text-xs font-bold">Fail Test</span>
              <span className="text-[10px] opacity-80">0% + Failed</span>
            </button>

            <button
              onClick={runSuspendTest}
              disabled={!isReady}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-all"
            >
              <Bookmark size={24} />
              <span className="text-xs font-bold">Suspend Test</span>
              <span className="text-[10px] opacity-80">Save & Resume</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-3 text-center">
            After running a test, click "Close & Save" below, then check your LMS gradebook
          </p>
        </section>

        {/* ===== VISUAL RESTORE TEST ===== */}
        <section className={`p-4 rounded-lg border-2 ${restoreTestWasRestored ? 'bg-green-50 border-green-300' : 'bg-purple-50 border-purple-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className={restoreTestWasRestored ? 'text-green-600' : 'text-purple-600'} size={20} />
            <h3 className="text-sm font-bold text-slate-900">Visual Restore Test</h3>
            {restoreTestWasRestored && (
              <span className="ml-auto px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <CheckCircle size={12} /> RESTORED!
              </span>
            )}
          </div>

          {restoreTestWasRestored && restoreTestOriginalValue !== null && (
            <div className="mb-3 p-2 bg-green-100 border border-green-300 rounded-lg text-sm text-green-800">
              <strong>Success!</strong> Slider was restored to <strong>{restoreTestOriginalValue}%</strong> from your previous session.
            </div>
          )}

          <div className="mb-3">
            <p className="text-xs text-slate-600 mb-2">
              Move the slider, save it, then close and reopen to verify data persistence:
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={restoreTestValue}
                onChange={(e) => {
                  setRestoreTestValue(parseInt(e.target.value));
                  setRestoreTestWasRestored(false);
                }}
                className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                disabled={!isReady}
              />
              <span className={`text-2xl font-bold w-16 text-right ${restoreTestWasRestored ? 'text-green-600' : 'text-purple-600'}`}>
                {restoreTestValue}%
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveRestoreTestSlider}
              disabled={!isReady}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
            >
              <Save size={16} /> Save Slider Position
            </button>
            <button
              onClick={resetRestoreTest}
              disabled={!isReady}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 text-sm rounded-lg transition-colors"
              title="Reset test"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <p className="text-[10px] text-slate-500 mt-2 text-center">
            After saving, click "Close & Save" below, then reopen the course from your LMS
          </p>
        </section>

        {/* ===== TROUBLESHOOTING TESTS ===== */}
        <button
          onClick={() => setShowTroubleshooting(!showTroubleshooting)}
          className="flex items-center justify-between w-full p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span className="font-bold text-sm">Troubleshooting Tests</span>
            <span className="text-xs opacity-70">Find LMS limits & issues</span>
          </div>
          {showTroubleshooting ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showTroubleshooting && (
          <div className="p-4 bg-amber-50 border border-t-0 border-amber-200 rounded-b-lg -mt-2 space-y-4">

            {/* Large Data Tests */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database size={16} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-800">Data Size Limits</span>
                <span className="text-[10px] text-amber-600 ml-auto">SCORM spec: 64KB max</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 10, 32, 64].map(size => (
                  <button
                    key={size}
                    onClick={() => testLargeData(size)}
                    disabled={!isReady}
                    className="px-3 py-2 bg-white border border-amber-300 rounded text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {size}KB
                  </button>
                ))}
              </div>
            </div>

            {/* Character & Encoding Tests */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type size={16} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-800">Character Encoding</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={testSpecialChars}
                  disabled={!isReady}
                  className="px-3 py-2 bg-white border border-amber-300 rounded text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Special Chars & Unicode
                </button>
                <button
                  onClick={testRapidCommits}
                  disabled={!isReady}
                  className="px-3 py-2 bg-white border border-amber-300 rounded text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Rapid Commits (10x)
                </button>
              </div>
            </div>

            {/* Score & Bookmark Tests */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gauge size={16} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-800">Edge Cases</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={testScoreEdgeCases}
                  disabled={!isReady}
                  className="px-3 py-2 bg-white border border-amber-300 rounded text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Score Edge Values
                </button>
                <button
                  onClick={() => testLongBookmark(1000)}
                  disabled={!isReady}
                  className="px-3 py-2 bg-white border border-amber-300 rounded text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Long Bookmark (1000 chars)
                </button>
              </div>
            </div>

            <p className="text-[10px] text-amber-600 text-center">
              Check the log console on the right for detailed results
            </p>
          </div>
        )}

        {/* Custom Score Slider */}
        <section className="p-4 rounded-lg border border-slate-200 bg-white">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Set Custom Grade</h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={customScore}
              onChange={(e) => setCustomScore(parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              disabled={!isReady}
            />
            <span className="text-2xl font-bold text-slate-700 w-16 text-right">{customScore}%</span>
            <Button onClick={setCustomScoreValue} disabled={!isReady} variant="secondary" className="text-xs">
              Set Grade
            </Button>
          </div>
        </section>

        {/* Save & Exit Section */}
        <section className="p-4 rounded-lg border-2 border-slate-300 bg-white">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Finish Test</h3>
          <p className="text-xs text-slate-500 mb-3">
            Choose how to end this session:
          </p>
          <div className="flex gap-2 mb-3">
            <select
              className="border rounded p-2 text-sm flex-1"
              value={cmiState.exit}
              onChange={(e) => setCmiState({...cmiState, exit: e.target.value})}
              disabled={!isReady}
            >
              <option value="suspend">Save progress & return later</option>
              <option value="normal">Complete - I'm finished</option>
              <option value="logout">Logout</option>
              <option value="time-out">Timeout</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCommit} disabled={!isReady} variant="secondary" fullWidth className="flex justify-center items-center gap-2">
              <Save size={16} /> Save Now
            </Button>
            <Button onClick={handleTerminate} disabled={!isReady} variant="danger" fullWidth className="flex justify-center items-center gap-2">
              <XCircle size={16} /> Close & Save
            </Button>
          </div>
        </section>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-center gap-2 p-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Settings size={16} />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Advanced Options (Collapsible) */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">

            {/* Manual Status Controls */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Manual Controls</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handleSetValue('cmi.completion_status', 'completed')} disabled={!isReady} variant="outline" className="text-xs">
                  Set Completed
                </Button>
                <Button onClick={() => handleSetValue('cmi.completion_status', 'incomplete')} disabled={!isReady} variant="outline" className="text-xs">
                  Set Incomplete
                </Button>
                <Button onClick={() => handleSetValue('cmi.success_status', 'passed')} disabled={!isReady} variant="outline" className="text-xs">
                  Set Passed
                </Button>
                <Button onClick={() => handleSetValue('cmi.success_status', 'failed')} disabled={!isReady} variant="outline" className="text-xs">
                  Set Failed
                </Button>
              </div>
            </section>

            {/* Bookmark & Suspend Data */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Bookmark & Progress Data</h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 text-sm flex-1 bg-white"
                    placeholder="Bookmark position"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    disabled={!isReady}
                  />
                  <Button onClick={() => handleSetValue('cmi.location', locationInput)} disabled={!isReady} variant="secondary" className="text-xs">
                    Set
                  </Button>
                </div>
                <div className="flex gap-2">
                  <textarea
                    className="border rounded px-2 py-1 text-sm flex-1 bg-white h-12 resize-none"
                    placeholder="Custom progress data"
                    value={suspendInput}
                    onChange={(e) => setSuspendInput(e.target.value)}
                    disabled={!isReady}
                  />
                  <Button onClick={() => handleSetValue('cmi.suspend_data', suspendInput)} disabled={!isReady} variant="secondary" className="text-xs h-12">
                    Set
                  </Button>
                </div>
              </div>
            </section>

            {/* Interactions */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Record Question Response</h3>
              <div className="flex gap-2 mb-2">
                <select
                  className="text-xs border rounded p-1 flex-1 bg-white"
                  value={interactionId}
                  onChange={(e) => setInteractionId(e.target.value)}
                  disabled={!isReady}
                >
                  <option value="question_1">Question 1</option>
                  <option value="question_2">Question 2</option>
                  <option value="question_3">Question 3</option>
                </select>
                <select
                  className="text-xs border rounded p-1 bg-white"
                  value={interactionResult}
                  onChange={(e) => setInteractionResult(e.target.value)}
                  disabled={!isReady}
                >
                  <option value="correct">Correct</option>
                  <option value="incorrect">Incorrect</option>
                </select>
                <Button onClick={handleInteraction} disabled={!isReady} variant="primary" className="text-xs">
                  Record
                </Button>
              </div>
            </section>

          </div>
        )}

        {/* Help & Export */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="secondary" onClick={() => setShowHelp(!showHelp)} className="flex items-center justify-center gap-2 flex-1">
            <HelpCircle size={16}/> {showHelp ? 'Hide Guide' : 'Testing Guide'}
          </Button>
          <Button variant="outline" onClick={exportLogs} className="flex items-center justify-center gap-2">
            <Download size={16}/> Export Log
          </Button>
        </div>

      </div>

      {/* RIGHT SIDE: STATUS & LOGS */}
      <div className="w-full md:w-1/2 lg:w-7/12 bg-slate-100 flex flex-col p-4 h-full overflow-hidden">

        {/* Learner Info Panel */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4 shrink-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <User size={14}/> Student & LMS Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-4">
            <div>
              <label className="text-[10px] text-slate-400 block">Name</label>
              <div className="text-sm font-semibold truncate">
                {cmiState.learnerName || <span className="text-slate-300 italic">Not available</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">ID</label>
              <div className="text-sm font-mono truncate">
                {cmiState.learnerId || <span className="text-slate-300 italic">Not available</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Credit</label>
              <div className="text-sm">
                {cmiState.credit ? (
                  <span className={`px-1.5 py-0.5 rounded text-xs ${cmiState.credit === 'credit' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {cmiState.credit === 'credit' ? 'For Credit' : 'No Credit'}
                  </span>
                ) : <span className="text-slate-300 italic">N/A</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Session Type</label>
              <div className="text-sm">
                {cmiState.entry === 'resume' ? (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">Resumed</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600">New Session</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Previous Time</label>
              <div className="text-sm font-mono flex items-center gap-1">
                <Clock size={12} className="text-slate-400"/>
                {cmiState.totalTime || <span className="text-slate-300">0:00:00</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Mode</label>
              <div className="text-sm capitalize">
                {cmiState.mode || 'normal'}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Language</label>
              <div className="text-sm">
                {cmiState.language || <span className="text-slate-300 italic">N/A</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Passing Score</label>
              <div className="text-sm font-mono">
                {cmiState.scaledPassingScore ? `${(parseFloat(cmiState.scaledPassingScore) * 100).toFixed(0)}%` : <span className="text-slate-300 italic">Not set</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Time Limit</label>
              <div className="text-sm font-mono">
                {cmiState.maxTimeAllowed || <span className="text-slate-300 italic">None</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Audio Level</label>
              <div className="text-sm">
                {cmiState.audioLevel ? `${(parseFloat(cmiState.audioLevel) * 100).toFixed(0)}%` : <span className="text-slate-300 italic">N/A</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Captions</label>
              <div className="text-sm">
                {cmiState.audioCaptioning === '1' ? (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">On</span>
                ) : cmiState.audioCaptioning === '-1' ? (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600">Off</span>
                ) : <span className="text-slate-300 italic">Default</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Launch Data</label>
              <div className="text-sm font-mono truncate" title={cmiState.launchData}>
                {cmiState.launchData || <span className="text-slate-300 italic">None</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Completion Threshold</label>
              <div className="text-sm font-mono">
                {cmiState.completionThreshold ? `${(parseFloat(cmiState.completionThreshold) * 100).toFixed(0)}%` : <span className="text-slate-300 italic">Not set</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Progress</label>
              <div className="text-sm font-mono">
                {cmiState.progressMeasure ? `${(parseFloat(cmiState.progressMeasure) * 100).toFixed(0)}%` : <span className="text-slate-300 italic">0%</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Objectives</label>
              <div className="text-sm font-mono">
                {cmiState.objectivesCount || <span className="text-slate-300 italic">0</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Interactions</label>
              <div className="text-sm font-mono">
                {cmiState.interactionsCount || <span className="text-slate-300 italic">0</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
          <StatusCard
            label="Progress"
            value={cmiState.completionStatus === 'completed' ? 'Complete' : cmiState.completionStatus === 'incomplete' ? 'In Progress' : 'Not Started'}
            color={cmiState.completionStatus === 'completed' ? 'green' : cmiState.completionStatus === 'incomplete' ? 'amber' : 'slate'}
            icon={cmiState.completionStatus === 'completed' ? <CheckCircle size={18} /> : <Activity size={18} />}
          />
          <StatusCard
            label="Result"
            value={cmiState.successStatus === 'passed' ? 'Passed' : cmiState.successStatus === 'failed' ? 'Failed' : 'Pending'}
            color={cmiState.successStatus === 'passed' ? 'green' : cmiState.successStatus === 'failed' ? 'red' : 'slate'}
            icon={cmiState.successStatus === 'passed' ? <CheckCircle size={18} /> : cmiState.successStatus === 'failed' ? <XCircle size={18} /> : <HelpCircle size={18} />}
          />
          <StatusCard
            label="Grade"
            value={cmiState.scoreRaw ? `${cmiState.scoreRaw}%` : '--'}
            color={cmiState.scoreRaw ? (parseInt(cmiState.scoreRaw) >= 70 ? 'green' : parseInt(cmiState.scoreRaw) >= 50 ? 'amber' : 'red') : 'slate'}
          />
          <StatusCard
            label="Bookmark"
            value={cmiState.location || 'None'}
            color={cmiState.location ? 'blue' : 'slate'}
            icon={<FileText size={18} />}
          />
        </div>

        {/* Help Guide */}
        {showHelp && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 text-sm text-blue-900 shrink-0 overflow-y-auto max-h-48 shadow-sm relative">
            <button onClick={() => setShowHelp(false)} className="absolute top-2 right-2 text-blue-400 hover:text-blue-700"><XCircle size={16}/></button>
            <div className="flex items-start gap-2 mb-3">
              <Info className="shrink-0 mt-1" size={18} />
              <div>
                <h4 className="font-bold text-base">How to Test Your LMS</h4>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h5 className="font-bold text-xs text-blue-600">Test 1: Verify Grades Work</h5>
                <ol className="list-decimal list-inside text-xs space-y-1 ml-2">
                  <li>Click the green <strong>Pass Test</strong> button</li>
                  <li>Click <strong>Close & Save</strong></li>
                  <li>Check your LMS gradebook - should show 100% and "Passed"</li>
                </ol>
              </div>
              <div>
                <h5 className="font-bold text-xs text-blue-600">Test 2: Verify Resume Works</h5>
                <ol className="list-decimal list-inside text-xs space-y-1 ml-2">
                  <li>Click the blue <strong>Suspend Test</strong> button</li>
                  <li>Click <strong>Close & Save</strong></li>
                  <li>Reopen the course - you should see "Resumed Session" and the saved bookmark</li>
                </ol>
              </div>
            </div>
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

// Enhanced Status Card
const StatusCard = ({
  label,
  value,
  icon,
  color = 'slate'
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: 'green' | 'red' | 'amber' | 'blue' | 'slate';
}) => {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    slate: 'bg-white border-slate-200 text-slate-700'
  };

  return (
    <div className={`p-3 rounded-lg shadow-sm border ${colors[color]}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
        {label}
      </div>
      <div className="font-bold text-sm truncate flex items-center gap-2">
        {icon}
        {value}
      </div>
    </div>
  );
};

export default App;
